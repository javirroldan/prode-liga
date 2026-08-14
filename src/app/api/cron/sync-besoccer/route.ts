import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchMatchday,
  normalizeTeamName,
  parseGoals,
  mapStatus,
  isPlaceholderRound,
} from "@/lib/besoccer";
import { calculatePoints } from "@/services/scoring";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Sincroniza las jornadas current-1 a current+2 desde BeSoccer.
// Cron de Vercel: */5 * * * *
async function syncRound(tournamentId: string, round: number) {
  const matches = await fetchMatchday(round);
  if (matches.length === 0) return { round, empty: true, updated: 0 };

  const placeholder = isPlaceholderRound(matches);
  let updated = 0;

  for (const m of matches) {
    const home = normalizeTeamName(m.local);
    const away = normalizeTeamName(m.visitor);

    const dbMatch = await prisma.match.findFirst({
      where: { tournamentId, matchday: round, homeTeam: home, awayTeam: away },
    });
    if (!dbMatch) continue;

    const data: Record<string, unknown> = {};

    if (dbMatch.apiId !== Number(m.id)) data.apiId = Number(m.id);

    if (!placeholder) {
      const datePart = m.schedule.slice(0, 10);
      const timePart = m.schedule.slice(11, 16);
      if (datePart && timePart) {
        const newDate = new Date(`${datePart}T${timePart}:00.000Z`);
        if (
          new Date(dbMatch.date).toISOString().slice(0, 16) !== newDate.toISOString().slice(0, 16) ||
          (dbMatch.time ?? "") !== timePart
        ) {
          data.date = newDate;
          data.time = timePart;
        }
      }
    }

    if (!dbMatch.manualResult) {
      const bsStatus = mapStatus(m.status);
      if (bsStatus === "FINISHED") {
        const homeGoals = parseGoals(m.local_goals);
        const awayGoals = parseGoals(m.visitor_goals);
        if (homeGoals !== null && awayGoals !== null) {
          const changed =
            dbMatch.homeGoals !== homeGoals ||
            dbMatch.awayGoals !== awayGoals ||
            dbMatch.status !== "FINISHED";
          if (changed) {
            data.homeGoals = homeGoals;
            data.awayGoals = awayGoals;
            data.status = "FINISHED";
          }
        }
      }
    }

    const keys = Object.keys(data);
    if (keys.length > 0) {
      await prisma.match.update({ where: { id: dbMatch.id }, data });
      updated++;
    }
  }

  return { round, empty: false, updated };
}

async function recalculatePoints(tournamentId: string) {
  const finishedMatches = await prisma.match.findMany({
    where: { tournamentId, status: "FINISHED" },
    include: { predictions: true },
  });

  for (const match of finishedMatches) {
    if (match.homeGoals === null || match.awayGoals === null) continue;
    for (const pred of match.predictions) {
      const points = calculatePoints(
        { homeGoals: pred.homeGoals, awayGoals: pred.awayGoals },
        { homeGoals: match.homeGoals, awayGoals: match.awayGoals }
      );
      if (pred.points !== points) {
        await prisma.prediction.update({ where: { id: pred.id }, data: { points } });
      }
    }
  }

  const participants = await prisma.participation.findMany({ where: { tournamentId } });
  for (const participant of participants) {
    const result = await prisma.prediction.aggregate({
      where: { userId: participant.userId, match: { tournamentId }, points: { not: null } },
      _sum: { points: true },
    });
    await prisma.participation.update({
      where: { id: participant.id },
      data: { totalPoints: result._sum.points || 0 },
    });
  }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const key = process.env.BESOCCER_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "BESOCCER_API_KEY no configurada" }, { status: 500 });
  }

  const tournament = await prisma.tournament.findFirst({ where: { isActive: true } });
  if (!tournament) {
    return NextResponse.json({ error: "No hay torneo activo" }, { status: 404 });
  }

  // Fecha actual: primera jornada cuyo primer partido es mañana o después
  const startOfTomorrow = new Date();
  startOfTomorrow.setHours(0, 0, 0, 0);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const matchdays = await prisma.match.groupBy({
    by: ["matchday"],
    where: { tournamentId: tournament.id },
    _min: { date: true },
    orderBy: { matchday: "asc" },
  });

  const future = matchdays.find((md) => md._min.date !== null && md._min.date >= startOfTomorrow);
  const futureIndex = future ? matchdays.indexOf(future) : -1;
  const current =
    futureIndex === -1
      ? matchdays[matchdays.length - 1]?.matchday
      : futureIndex === 0
        ? matchdays[0].matchday
        : matchdays[futureIndex - 1].matchday;

  const rounds: number[] = [];
  for (let r = (current ?? 1) - 1; r <= (current ?? 1) + 2; r++) {
    if (r >= 1 && r <= 16 && !rounds.includes(r)) rounds.push(r);
  }

  const results = [];
  for (const round of rounds) {
    try {
      results.push(await syncRound(tournament.id, round));
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      results.push({ round, error: e instanceof Error ? e.message : String(e) });
    }
  }

  await recalculatePoints(tournament.id);

  return NextResponse.json({ current, results });
}
