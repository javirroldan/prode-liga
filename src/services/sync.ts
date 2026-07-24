import { prisma } from "@/lib/prisma";
import { getFixturesByRound, getLiveFixtures, mapStatus, extractRoundNumber } from "./football-api";

export async function syncFixtures(matchday: number): Promise<{
  created: number;
  updated: number;
  errors: string[];
}> {
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  try {
    const fixtures = await getFixturesByRound(matchday);

    // Get or create tournament
    let tournament = await prisma.tournament.findFirst({
      where: { isActive: true },
    });

    if (!tournament) {
      tournament = await prisma.tournament.create({
        data: {
          name: "Liga Profesional Argentina 2026",
          season: "2026",
          inviteCode: "LIGA2026",
          isActive: true,
        },
      });
    }

    for (const fixture of fixtures) {
      try {
        const existing = await prisma.match.findUnique({
          where: { apiId: fixture.fixture.id },
        });

        const matchData = {
          apiId: fixture.fixture.id,
          tournamentId: tournament.id,
          matchday: extractRoundNumber(fixture.league.round),
          date: new Date(fixture.fixture.date),
          time: new Date(fixture.fixture.date).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          homeLogo: fixture.teams.home.logo,
          awayLogo: fixture.teams.away.logo,
          homeGoals: fixture.goals.home,
          awayGoals: fixture.goals.away,
          status: mapStatus(fixture.fixture.status.short),
        };

        if (existing) {
          await prisma.match.update({
            where: { id: existing.id },
            data: matchData,
          });
          updated++;
        } else {
          await prisma.match.create({ data: matchData });
          created++;
        }
      } catch (e) {
        errors.push(`Error with fixture ${fixture.fixture.id}: ${e}`);
      }
    }
  } catch (e) {
    errors.push(`Error fetching fixtures for round ${matchday}: ${e}`);
  }

  return { created, updated, errors };
}

export async function syncLiveScores(): Promise<{
  updated: number;
  errors: string[];
}> {
  let updated = 0;
  const errors: string[] = [];

  try {
    const liveFixtures = await getLiveFixtures();

    for (const fixture of liveFixtures) {
      try {
        await prisma.match.updateMany({
          where: { apiId: fixture.fixture.id },
          data: {
            homeGoals: fixture.goals.home,
            awayGoals: fixture.goals.away,
            status: mapStatus(fixture.fixture.status.short),
          },
        });
        updated++;
      } catch (e) {
        errors.push(`Error updating live fixture ${fixture.fixture.id}: ${e}`);
      }
    }
  } catch (e) {
    errors.push(`Error fetching live fixtures: ${e}`);
  }

  return { updated, errors };
}

export async function calculateAndStorePoints(): Promise<{
  updated: number;
  errors: string[];
}> {
  let updated = 0;
  const errors: string[] = [];

  try {
    // Get all finished matches with predictions
    const finishedMatches = await prisma.match.findMany({
      where: { status: "FINISHED" },
      include: { predictions: true },
    });

    for (const match of finishedMatches) {
      if (match.homeGoals === null || match.awayGoals === null) continue;

      for (const prediction of match.predictions) {
        try {
          let points = 0;

          // Exact score
          if (prediction.homeGoals === match.homeGoals && prediction.awayGoals === match.awayGoals) {
            points = 12;
          } else {
            // Correct winner or draw
            const predResult = getMatchResult(prediction.homeGoals, prediction.awayGoals);
            const resResult = getMatchResult(match.homeGoals, match.awayGoals);

            if (predResult === resResult) {
              points = 5;
            }

            // Correct goals for one team
            if (prediction.homeGoals === match.homeGoals && prediction.awayGoals !== match.awayGoals) {
              points = Math.max(points, 2);
            }
            if (prediction.awayGoals === match.awayGoals && prediction.homeGoals !== match.homeGoals) {
              points = Math.max(points, 2);
            }

            points = Math.min(points, 12);
          }

          await prisma.prediction.update({
            where: { id: prediction.id },
            data: { points },
          });
          updated++;
        } catch (e) {
          errors.push(`Error calculating points for prediction ${prediction.id}: ${e}`);
        }
      }
    }

    // Update total points for all participations
    const participations = await prisma.participation.findMany();

    for (const participation of participations) {
      try {
        const userPredictions = await prisma.prediction.findMany({
          where: {
            userId: participation.userId,
            match: { tournamentId: participation.tournamentId },
            points: { not: null },
          },
        });

        const totalPoints = userPredictions.reduce((sum, p) => sum + (p.points || 0), 0);

        await prisma.participation.update({
          where: { id: participation.id },
          data: { totalPoints },
        });
      } catch (e) {
        errors.push(`Error updating participation ${participation.id}: ${e}`);
      }
    }
  } catch (e) {
    errors.push(`Error in calculateAndStorePoints: ${e}`);
  }

  return { updated, errors };
}

function getMatchResult(homeGoals: number, awayGoals: number): "home" | "away" | "draw" {
  if (homeGoals > awayGoals) return "home";
  if (homeGoals < awayGoals) return "away";
  return "draw";
}
