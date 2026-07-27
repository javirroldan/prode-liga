"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { calculatePoints } from "@/services/scoring";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    throw new Error("Acceso denegado: se requieren permisos de administrador");
  }
  return user;
}

export async function createTournament(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const season = formData.get("season") as string;

  if (!name || !season) {
    return { error: "Nombre y temporada son obligatorios" };
  }

  const firstWord = name.split(/\s+/)[0].toUpperCase().substring(0, 4);
  const seasonSuffix = season.replace(/^20/, "").substring(0, 2);
  let inviteCode = firstWord + seasonSuffix;

  const existing = await prisma.tournament.findUnique({ where: { inviteCode } });
  if (existing) {
    inviteCode += Math.floor(Math.random() * 10);
  }

  await prisma.tournament.create({
    data: {
      name,
      season,
      inviteCode,
    },
  });

  revalidatePath("/admin");
  return { success: true, inviteCode };
}

export async function deleteTournament(tournamentId: string) {
  await requireAdmin();

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) return { error: "Torneo no encontrado" };

  await prisma.tournament.delete({ where: { id: tournamentId } });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/ranking");
  revalidatePath("/fixture");
  return { success: true };
}

export async function getUsersWithoutPrediction(matchday: number) {
  await requireAdmin();

  const tournament = await prisma.tournament.findFirst({
    where: { isActive: true },
  });

  if (!tournament) return [];

  const matches = await prisma.match.findMany({
    where: { matchday, tournamentId: tournament.id },
  });

  const matchIds = matches.map((m) => m.id);

  const usersWithPrediction = await prisma.prediction.findMany({
    where: {
      matchId: { in: matchIds },
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  const userIdsWithPrediction = usersWithPrediction.map((p) => p.userId);

  const allParticipants = await prisma.participation.findMany({
    where: { tournamentId: tournament.id },
    include: {
      user: {
        select: {
          name: true,
          nickname: true,
        },
      },
    },
  });

  return allParticipants
    .filter((p) => !userIdsWithPrediction.includes(p.userId))
    .map((p) => p.user);
}

export async function getMatchdayResults(matchday: number) {
  await requireAdmin();

  return prisma.match.findMany({
    where: { matchday },
    orderBy: { date: "asc" },
    include: {
      predictions: {
        include: {
          user: {
            select: { nickname: true },
          },
        },
      },
    },
  });
}

export async function setMatchStatus(matchId: string, status: "SCHEDULED" | "LIVE") {
  await requireAdmin();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return { error: "Partido no encontrado" };

  const wasFinished = match.status === "FINISHED";

  await prisma.match.update({
    where: { id: matchId },
    data: { status, homeGoals: null, awayGoals: null },
  });

  if (wasFinished) {
    const predictions = await prisma.prediction.findMany({ where: { matchId } });
    for (const pred of predictions) {
      await prisma.prediction.update({
        where: { id: pred.id },
        data: { points: null },
      });
    }
    await updateParticipantPoints(match.tournamentId);
  }

  revalidatePath("/admin");
  revalidatePath("/fixture");
  revalidatePath("/ranking");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateLiveScore(
  matchId: string,
  homeGoals: number,
  awayGoals: number
) {
  await requireAdmin();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return { error: "Partido no encontrado" };

  if (match.status !== "LIVE") {
    return { error: "Solo se pueden cargar parciales en partidos en vivo" };
  }

  if (homeGoals < 0 || awayGoals < 0) {
    return { error: "Los goles no pueden ser negativos" };
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { homeGoals, awayGoals },
  });

  revalidatePath("/admin");
  revalidatePath("/fixture");
  return { success: true };
}

export async function submitMatchResult(
  matchId: string,
  homeGoals: number,
  awayGoals: number
) {
  const user = await requireAdmin();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return { error: "Partido no encontrado" };

  const wasFinished = match.status === "FINISHED";

  if (homeGoals < 0 || awayGoals < 0) {
    return { error: "Los goles no pueden ser negativos" };
  }

  // Update match with result
  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeGoals,
      awayGoals,
      status: "FINISHED",
    },
  });

  // Calculate points for all predictions on this match
  const predictions = await prisma.prediction.findMany({
    where: { matchId },
  });

  for (const pred of predictions) {
    const points = calculatePoints(
      { homeGoals: pred.homeGoals, awayGoals: pred.awayGoals },
      { homeGoals, awayGoals }
    );

    await prisma.prediction.update({
      where: { id: pred.id },
      data: { points },
    });
  }

  // Update total points for all participants in the tournament
  await updateParticipantPoints(match.tournamentId);

  revalidatePath("/admin");
  revalidatePath("/ranking");
  revalidatePath("/dashboard");
  return { success: true };
}

async function updateParticipantPoints(tournamentId: string) {
  const participants = await prisma.participation.findMany({
    where: { tournamentId },
  });

  for (const participant of participants) {
    const result = await prisma.prediction.aggregate({
      where: {
        userId: participant.userId,
        match: { tournamentId },
        points: { not: null },
      },
      _sum: { points: true },
    });

    await prisma.participation.update({
      where: { id: participant.id },
      data: { totalPoints: result._sum.points || 0 },
    });
  }
}

export async function resetMatchday(matchday: number) {
  await requireAdmin();

  const tournament = await prisma.tournament.findFirst({
    where: { isActive: true },
  });

  if (!tournament) return { error: "No hay torneo activo" };

  const matches = await prisma.match.findMany({
    where: { tournamentId: tournament.id, matchday },
  });

  for (const match of matches) {
    await prisma.prediction.deleteMany({ where: { matchId: match.id } });

    await prisma.match.update({
      where: { id: match.id },
      data: { homeGoals: null, awayGoals: null, status: "SCHEDULED" },
    });
  }

  await updateParticipantPoints(tournament.id);

  revalidatePath("/admin");
  revalidatePath("/ranking");
  revalidatePath("/dashboard");
  revalidatePath("/fixture");
  return { success: true };
}
