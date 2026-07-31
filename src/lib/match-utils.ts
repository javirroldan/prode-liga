import { prisma } from "@/lib/prisma";

/**
 * Check if a match is locked (cannot accept predictions).
 * Locked when less than 1 hour until kickoff or match already started.
 */
export function isMatchLocked(matchDate: Date, time: string | null): boolean {
  const now = new Date();
  const matchDateTime = new Date(matchDate);

  if (time) {
    const [hours, minutes] = time.split(":").map(Number);
    matchDateTime.setHours(hours, minutes, 0, 0);
  }

  const diff = matchDateTime.getTime() - now.getTime();
  const oneHourMs = 60 * 60 * 1000;

  return diff <= oneHourMs;
}

/**
 * Determine which matchday to show based on pending matches.
 *
 * Logic:
 * 1. Find the oldest matchday that still has SCHEDULED or LIVE matches
 * 2. If none, show the last matchday (all finished)
 * 3. Handles overlapping matchdays (e.g., postponed matches from Fecha 2
 *    played after Fecha 3 starts)
 */
export async function getCurrentMatchday(tournamentId: string): Promise<number | null> {
  const matchdays = await prisma.match.groupBy({
    by: ["matchday"],
    where: { tournamentId },
    _min: { date: true },
    orderBy: { matchday: "asc" },
  });

  if (matchdays.length === 0) {
    return null;
  }

  // Find matchdays that still have pending (SCHEDULED or LIVE) matches
  const matchdaysWithPending = await prisma.match.groupBy({
    by: ["matchday"],
    where: { tournamentId, status: { in: ["SCHEDULED", "LIVE"] } },
    _count: { id: true },
    orderBy: { matchday: "asc" },
  });

  if (matchdaysWithPending.length > 0) {
    return matchdaysWithPending[0].matchday;
  }

  // No pending matches, show the last matchday
  return matchdays[matchdays.length - 1].matchday;
}

/**
 * Get matches from other matchdays that are still pending (SCHEDULED or LIVE).
 * Used to show postponed matches that overlap with the current matchday.
 * Includes predictions for the current user.
 */
export async function getPendingMatchesFromOtherMatchdays(
  tournamentId: string,
  currentMatchday: number,
  userId?: string
) {
  const matches = await prisma.match.findMany({
    where: {
      tournamentId,
      status: { in: ["SCHEDULED", "LIVE"] },
      NOT: { matchday: currentMatchday },
    },
    orderBy: [{ matchday: "asc" }, { date: "asc" }],
  });

  if (!userId || matches.length === 0) {
    return matches.map((m) => ({ ...m, prediction: null }));
  }

  const matchIds = matches.map((m) => m.id);
  const predictions = await prisma.prediction.findMany({
    where: { userId, matchId: { in: matchIds } },
  });

  return matches.map((match) => ({
    ...match,
    prediction: predictions.find((p) => p.matchId === match.id) || null,
  }));
}
