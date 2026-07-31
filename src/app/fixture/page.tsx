import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { getCurrentMatchday, getPendingMatchesFromOtherMatchdays } from "@/lib/match-utils";
import { MatchCard } from "@/components/fixture/match-card";
import { MatchdaySelector } from "@/components/fixture/matchday-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Calendar, Clock } from "lucide-react";

export default async function FixturePage({
  searchParams,
}: {
  searchParams: Promise<{ matchday?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const tournament = await prisma.tournament.findFirst({
    where: { isActive: true },
  });

  if (!tournament) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Fixture</h1>
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-8 text-center text-white/50">
            No hay torneos activos. Unite a uno desde el dashboard.
          </CardContent>
        </Card>
      </div>
    );
  }

  const autoMatchday = await getCurrentMatchday(tournament.id);
  const currentMatchday = params.matchday ? parseInt(params.matchday) : autoMatchday;

  const maxMatchday = await prisma.match.aggregate({
    where: { tournamentId: tournament.id },
    _max: { matchday: true },
  });
  const totalMatchdays = maxMatchday._max.matchday || 16;

  if (!currentMatchday) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Fixture</h1>
          <p className="text-white/50">{tournament.name}</p>
        </div>
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-8 text-center text-white/50">
            No hay fechas disponibles todavia.
          </CardContent>
        </Card>
      </div>
    );
  }

  const matches = await prisma.match.findMany({
    where: { tournamentId: tournament.id, matchday: currentMatchday },
    orderBy: { date: "asc" },
  });

  const matchIds = matches.map((m) => m.id);
  const predictions = await prisma.prediction.findMany({
    where: { userId: user.id, matchId: { in: matchIds } },
  });

  const pendingMatches = await getPendingMatchesFromOtherMatchdays(
    tournament.id,
    currentMatchday,
    user.id
  );

  const totalMatches = matches.length;
  const finishedMatches = matches.filter((m) => m.status === "FINISHED").length;
  const allFinished = finishedMatches === totalMatches && totalMatches > 0;
  const isActive = currentMatchday === autoMatchday;
  const isPast = autoMatchday !== null && currentMatchday < autoMatchday;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Fixture</h1>
        <p className="text-white/50">
          {tournament.name} - FECHA {currentMatchday}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="gap-1 bg-white/10 text-white/70 border-white/10">
          <Calendar className="h-3 w-3" />
          {totalMatches} partidos
        </Badge>
        {finishedMatches > 0 && (
          <Badge variant="success" className="gap-1">
            {finishedMatches} finalizados
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">FECHA {currentMatchday}</h2>
        <MatchdaySelector currentMatchday={currentMatchday} totalMatchdays={totalMatchdays} baseUrl="/fixture" />
      </div>

      {!isActive && isPast && (
        <Card className="border-blue-500/30 bg-blue-500/5 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-blue-400">
              Esta fecha ya paso. Los pronosticos no se pueden cargar.
            </p>
          </CardContent>
        </Card>
      )}

      {!isActive && !isPast && allFinished && (
        <Card className="border-yellow-500/30 bg-yellow-500/5 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto mb-2 h-6 w-6 text-yellow-400" />
            <p className="text-sm text-yellow-400">
              Fecha finalizada. La proxima fecha estara disponible en 24 horas.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {matches.length === 0 ? (
          <Card className="col-span-full border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="p-8 text-center text-white/50">
              No hay partidos para esta fecha
            </CardContent>
          </Card>
        ) : (
          matches.map((match) => {
            const prediction = predictions.find((p) => p.matchId === match.id);
            return (
              <MatchCard
                key={match.id}
                match={{
                  ...match,
                  date: match.date.toISOString(),
                }}
                prediction={
                  prediction
                    ? {
                        homeGoals: prediction.homeGoals,
                        awayGoals: prediction.awayGoals,
                        points: prediction.points,
                      }
                    : null
                }
              />
            );
          })
        )}
      </div>

      {/* Pending matches from other matchdays */}
      {pendingMatches.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Partidos pendientes de otra fecha</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingMatches.map((match: any) => (
              <MatchCard
                key={match.id}
                match={{
                  ...match,
                  date: match.date.toISOString(),
                }}
                prediction={
                  match.prediction
                    ? {
                        homeGoals: match.prediction.homeGoals,
                        awayGoals: match.prediction.awayGoals,
                        points: match.prediction.points,
                      }
                    : null
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
