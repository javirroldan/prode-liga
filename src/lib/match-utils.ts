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
 * Determine which matchday to show based on the date of the first match.
 *
 * Logic:
 * 1. Get all matchdays with their earliest match date, ordered by date
 * 2. Find the first matchday whose first match is in the future
 * 3. The "current" matchday is the one before that
 * 4. If no future matchday exists, show the last one
 */
export async function getCurrentMatchday(tournamentId: string): Promise<number | null> {
  const now = new Date();

  // Get all matchdays with their earliest match date
  const matchdays = await prisma.match.groupBy({
    by: ["matchday"],
    where: { tournamentId },
    _min: { date: true },
    orderBy: { matchday: "asc" },
  });

  if (matchdays.length === 0) {
    return null;
  }

  // Find the first matchday whose first match is in the future
  const futureMatchday = matchdays.find((md) => md._min.date !== null && md._min.date > now);

  if (!futureMatchday) {
    // No future matchday, show the last one
    return matchdays[matchdays.length - 1].matchday;
  }

  // Get the index of the future matchday
  const futureIndex = matchdays.indexOf(futureMatchday);

  if (futureIndex === 0) {
    // All matchdays are in the future, show the first one
    return matchdays[0].matchday;
  }

  // The current matchday is the one before the future one
  return matchdays[futureIndex - 1].matchday;
}
