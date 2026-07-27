"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

export async function joinTournament(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Debés iniciar sesión" };
  }

  const inviteCode = formData.get("inviteCode") as string;

  if (!inviteCode) {
    return { error: "Ingresá un código de invitación" };
  }

  const tournament = await prisma.tournament.findUnique({
    where: { inviteCode },
  });

  if (!tournament) {
    return { error: "Código de invitación inválido" };
  }

  const existingParticipation = await prisma.participation.findUnique({
    where: {
      userId_tournamentId: {
        userId: user.id,
        tournamentId: tournament.id,
      },
    },
  });

  if (existingParticipation) {
    return { error: "Ya estás participando en este torneo" };
  }

  await prisma.participation.create({
    data: {
      userId: user.id,
      tournamentId: tournament.id,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, tournamentName: tournament.name };
}

export async function getTournamentRanking(tournamentId: string) {
  return prisma.participation.findMany({
    where: { tournamentId },
    include: {
      user: {
        select: {
          name: true,
          nickname: true,
          avatar: true,
        },
      },
    },
    orderBy: { totalPoints: "desc" },
  });
}

export async function leaveTournament(tournamentId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Debés iniciar sesión" };
  }

  const participation = await prisma.participation.findUnique({
    where: {
      userId_tournamentId: {
        userId: user.id,
        tournamentId,
      },
    },
  });

  if (!participation) {
    return { error: "No estás participando en este torneo" };
  }

  await prisma.participation.delete({
    where: { id: participation.id },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function leaveTournamentAction(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  await leaveTournament(tournamentId);
}

export async function getUserTournaments() {
  const user = await getCurrentUser();
  if (!user) return [];

  return prisma.participation.findMany({
    where: { userId: user.id },
    include: {
      tournament: true,
    },
    orderBy: { joinedAt: "asc" },
  });
}

export type RankingEntry = {
  userId: string;
  nickname: string;
  avatar: string | null;
  totalPoints: number;
  exact12: number;
  winner7: number;
  winner5: number;
  goals2: number;
};

export async function getRankingWithTiebreak(tournamentId: string): Promise<RankingEntry[]> {
  const participations = await prisma.participation.findMany({
    where: { tournamentId },
    include: {
      user: {
        select: { nickname: true, avatar: true },
      },
    },
  });

  const userIds = participations.map((p) => p.userId);

  const predictions = await prisma.prediction.findMany({
    where: {
      userId: { in: userIds },
      match: { tournamentId },
      points: { not: null },
    },
    select: { userId: true, points: true },
  });

  const userPredictions = new Map<string, number[]>();
  for (const pred of predictions) {
    const arr = userPredictions.get(pred.userId) || [];
    arr.push(pred.points!);
    userPredictions.set(pred.userId, arr);
  }

  const entries: RankingEntry[] = participations.map((p) => {
    const preds = userPredictions.get(p.userId) || [];
    const counts = { exact12: 0, winner7: 0, winner5: 0, goals2: 0 };
    for (const pts of preds) {
      if (pts === 12) counts.exact12++;
      else if (pts === 7) counts.winner7++;
      else if (pts === 5) counts.winner5++;
      else if (pts === 2) counts.goals2++;
    }
    return {
      userId: p.userId,
      nickname: p.user.nickname,
      avatar: p.user.avatar,
      totalPoints: p.totalPoints,
      ...counts,
    };
  });

  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exact12 !== a.exact12) return b.exact12 - a.exact12;
    if (b.winner7 !== a.winner7) return b.winner7 - a.winner7;
    if (b.winner5 !== a.winner5) return b.winner5 - a.winner5;
    return b.goals2 - a.goals2;
  });

  return entries;
}

export async function getMatchdayRanking(
  tournamentId: string,
  matchday: number
): Promise<RankingEntry[]> {
  const predictions = await prisma.prediction.findMany({
    where: {
      match: { tournamentId, matchday },
      points: { not: null },
    },
    include: {
      user: {
        select: { nickname: true, avatar: true },
      },
    },
  });

  const userMap = new Map<
    string,
    { nickname: string; avatar: string | null; totalPoints: number; exact12: number; winner7: number; winner5: number; goals2: number }
  >();

  for (const pred of predictions) {
    const existing = userMap.get(pred.userId);
    const pts = pred.points!;
    const extra =
      pts === 12
        ? { exact12: 1, winner7: 0, winner5: 0, goals2: 0 }
        : pts === 7
        ? { exact12: 0, winner7: 1, winner5: 0, goals2: 0 }
        : pts === 5
        ? { exact12: 0, winner7: 0, winner5: 1, goals2: 0 }
        : pts === 2
        ? { exact12: 0, winner7: 0, winner5: 0, goals2: 1 }
        : { exact12: 0, winner7: 0, winner5: 0, goals2: 0 };

    if (existing) {
      existing.totalPoints += pts;
      existing.exact12 += extra.exact12;
      existing.winner7 += extra.winner7;
      existing.winner5 += extra.winner5;
      existing.goals2 += extra.goals2;
    } else {
      userMap.set(pred.userId, {
        nickname: pred.user.nickname,
        avatar: pred.user.avatar,
        totalPoints: pts,
        ...extra,
      });
    }
  }

  const entries: RankingEntry[] = Array.from(userMap.entries()).map(
    ([userId, data]) => ({ userId, ...data })
  );

  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exact12 !== a.exact12) return b.exact12 - a.exact12;
    if (b.winner7 !== a.winner7) return b.winner7 - a.winner7;
    if (b.winner5 !== a.winner5) return b.winner5 - a.winner5;
    return b.goals2 - a.goals2;
  });

  return entries;
}

export async function getUserStats(
  tournamentId: string,
  userId: string
): Promise<{ exact12: number; winner7: number; winner5: number; goals2: number; zero: number }> {
  const predictions = await prisma.prediction.findMany({
    where: {
      userId,
      match: { tournamentId },
      points: { not: null },
    },
    select: { points: true },
  });

  const stats = { exact12: 0, winner7: 0, winner5: 0, goals2: 0, zero: 0 };
  for (const pred of predictions) {
    if (pred.points === 12) stats.exact12++;
    else if (pred.points === 7) stats.winner7++;
    else if (pred.points === 5) stats.winner5++;
    else if (pred.points === 2) stats.goals2++;
    else stats.zero++;
  }

  return stats;
}

export async function getAvailableMatchdays(tournamentId: string): Promise<number[]> {
  const matchdays = await prisma.match.findMany({
    where: { tournamentId },
    distinct: ["matchday"],
    select: { matchday: true },
    orderBy: { matchday: "asc" },
  });
  return matchdays.map((m) => m.matchday);
}
