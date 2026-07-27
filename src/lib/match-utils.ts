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
 * Determine which matchday to show for users automatically.
 *
 * Logic:
 * 1. Find the first matchday with SCHEDULED or LIVE matches → that's the current matchday
 * 2. If no active matchday (all FINISHED/POSTPONED):
 *    a. Find the last FINISHED matchday
 *    b. Check if 24 hours have passed since its last match ended
 *    c. If yes and there's a next matchday → return the next matchday
 *    d. If no → return null (show "waiting" message)
 */
export async function getCurrentMatchday(tournamentId: string): Promise<number | null> {
  const now = new Date();

  // 1. Find first matchday with SCHEDULED or LIVE matches
  const activeMatch = await prisma.match.findFirst({
    where: {
      tournamentId,
      status: { in: ["SCHEDULED", "LIVE"] },
    },
    orderBy: [{ matchday: "asc" }, { date: "asc" }],
  });

  if (activeMatch) {
    return activeMatch.matchday;
  }

  // 2. All matches are FINISHED or POSTPONED
  // Find the last FINISHED matchday
  const lastFinished = await prisma.match.findFirst({
    where: {
      tournamentId,
      status: "FINISHED",
    },
    orderBy: [{ matchday: "desc" }, { date: "desc" }],
  });

  if (!lastFinished) {
    // No finished matches at all, return first matchday
    const firstMatch = await prisma.match.findFirst({
      where: { tournamentId },
      orderBy: { matchday: "asc" },
    });
    return firstMatch?.matchday ?? null;
  }

  // Get the last match date/time from that matchday
  const lastMatchInDay = await prisma.match.findFirst({
    where: {
      tournamentId,
      matchday: lastFinished.matchday,
      status: "FINISHED",
    },
    orderBy: { date: "desc" },
  });

  if (!lastMatchInDay) {
    return lastFinished.matchday;
  }

  // Calculate when the matchday ended
  const matchEnd = new Date(lastMatchInDay.date);
  if (lastMatchInDay.time) {
    const [hours, minutes] = lastMatchInDay.time.split(":").map(Number);
    matchEnd.setHours(hours, minutes, 0, 0);
  }
  // Assume match lasts ~2 hours
  matchEnd.setHours(matchEnd.getHours() + 2);

  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  const timeSinceEnd = now.getTime() - matchEnd.getTime();

  if (timeSinceEnd >= twentyFourHoursMs) {
    // 24 hours passed, check if there's a next matchday
    const nextMatchday = await prisma.match.findFirst({
      where: {
        tournamentId,
        matchday: { gt: lastFinished.matchday },
      },
      orderBy: { matchday: "asc" },
    });

    if (nextMatchday) {
      return nextMatchday.matchday;
    }
  }

  // Still within 24 hours, show the last finished matchday
  // (user sees "Fecha finalizada" message)
  return lastFinished.matchday;
}
