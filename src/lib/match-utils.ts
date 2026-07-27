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
 * Determine which matchday to show for dashboard users automatically.
 *
 * Logic:
 * 1. Find the first matchday with SCHEDULED or LIVE matches
 * 2. If there's a previous finished matchday, check if 24h passed
 * 3. If 24h NOT passed → show the finished matchday (waiting message)
 * 4. If 24h passed or no previous finished → show the active matchday
 */
export async function getCurrentMatchday(tournamentId: string): Promise<number | null> {
  const now = new Date();

  // Find first matchday with SCHEDULED or LIVE matches
  const activeMatch = await prisma.match.findFirst({
    where: {
      tournamentId,
      status: { in: ["SCHEDULED", "LIVE"] },
    },
    orderBy: [{ matchday: "asc" }, { date: "asc" }],
  });

  if (!activeMatch) {
    // All finished, return last finished matchday
    const lastFinished = await prisma.match.findFirst({
      where: { tournamentId, status: "FINISHED" },
      orderBy: [{ matchday: "desc" }, { date: "desc" }],
    });
    return lastFinished?.matchday ?? null;
  }

  const activeMatchday = activeMatch.matchday;

  // Check if there's a finished matchday before the active one
  const lastFinishedBefore = await prisma.match.findFirst({
    where: {
      tournamentId,
      status: "FINISHED",
      matchday: { lt: activeMatchday },
    },
    orderBy: [{ matchday: "desc" }, { date: "desc" }],
  });

  if (!lastFinishedBefore) {
    // No finished matchday before, show the active one
    return activeMatchday;
  }

  // Check if 24 hours passed since the last finished matchday ended
  const lastMatchInDay = await prisma.match.findFirst({
    where: {
      tournamentId,
      matchday: lastFinishedBefore.matchday,
      status: "FINISHED",
    },
    orderBy: { date: "desc" },
  });

  if (!lastMatchInDay) {
    return activeMatchday;
  }

  const matchEnd = new Date(lastMatchInDay.date);
  if (lastMatchInDay.time) {
    const [hours, minutes] = lastMatchInDay.time.split(":").map(Number);
    matchEnd.setHours(hours, minutes, 0, 0);
  }
  matchEnd.setHours(matchEnd.getHours() + 2);

  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  const timeSinceEnd = now.getTime() - matchEnd.getTime();

  if (timeSinceEnd < twentyFourHoursMs) {
    // 24h NOT passed, show the finished matchday (waiting message)
    return lastFinishedBefore.matchday;
  }

  // 24h passed, show the active matchday
  return activeMatchday;
}
