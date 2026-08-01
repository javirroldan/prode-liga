import { getMatchdayPredictions } from "@/actions/predictions";
import { getUserTournaments, leaveTournamentAction } from "@/actions/tournaments";
import { getCurrentUser } from "@/actions/auth";
import { getCurrentMatchday } from "@/lib/match-utils";
import { MatchCard } from "@/components/fixture/match-card";
import { JoinTournamentForm } from "@/components/shared/join-tournament-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Trophy, Target, TrendingUp, LogOut, Clock, CalendarX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tournamentId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const selectedTournamentId = params.tournamentId;

  const tournaments = await getUserTournaments();

  if (tournaments.length > 0 && !selectedTournamentId) {
    redirect(`/dashboard?tournamentId=${tournaments[0].tournamentId}`);
  }

  if (selectedTournamentId && !tournaments.find((t) => t.tournamentId === selectedTournamentId)) {
    if (tournaments.length > 0) {
      redirect(`/dashboard?tournamentId=${tournaments[0].tournamentId}`);
    } else {
      redirect("/dashboard");
    }
  }

  const activeTournamentId = selectedTournamentId || null;

  const currentMatchday = activeTournamentId
    ? await getCurrentMatchday(activeTournamentId)
    : null;

  const matches = activeTournamentId && currentMatchday
    ? await getMatchdayPredictions(currentMatchday, activeTournamentId)
    : [];

  const predictionsCount = matches.filter((m: { prediction: unknown }) => m.prediction).length;

  const totalPoints = tournaments.reduce(
    (sum: number, t: { totalPoints: number }) => sum + t.totalPoints,
    0
  );

  const allFinished = matches.length > 0 && matches.every((m: { status: string }) => m.status === "FINISHED");

  // Get postponed matches from previous matchdays
  const postponedMatches = activeTournamentId && currentMatchday
    ? await prisma.match.findMany({
        where: {
          tournamentId: activeTournamentId,
          status: "POSTPONED",
          matchday: { lt: currentMatchday },
        },
        orderBy: { date: "asc" },
      })
    : [];

  // Get user predictions for postponed matches
  const postponedMatchIds = postponedMatches.map((m) => m.id);
  const postponedPredictions = postponedMatchIds.length > 0
    ? await prisma.prediction.findMany({
        where: {
          userId: user.id,
          matchId: { in: postponedMatchIds },
        },
      })
    : [];

  const postponedWithPredictions = postponedMatches.map((match) => ({
    ...match,
    prediction: postponedPredictions.find((p) => p.matchId === match.id) || null,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Hola, <span className="text-blue-400">{user.nickname}</span>
        </h1>
        <p className="text-white/50">
          {activeTournamentId
            ? currentMatchday
              ? `Fecha ${currentMatchday} de la Liga Profesional Argentina`
              : "Cargando fecha..."
            : "Unite a un torneo para comenzar"}
        </p>
      </div>

      {/* Tournament Tabs */}
      {tournaments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tournaments.map((t: { tournamentId: string; tournament: { name: string }; totalPoints: number }) => {
            const isActive = t.tournamentId === activeTournamentId;
            return (
              <div key={t.tournamentId} className="flex items-center gap-1">
                <Link href={`/dashboard?tournamentId=${t.tournamentId}`}>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-white/5 text-white/50 hover:bg-white/10 border-white/10"
                    }`}
                  >
                    {t.tournament.name}
                    <span className="ml-1.5 text-xs opacity-70">{t.totalPoints} pts</span>
                  </Badge>
                </Link>
                <form action={leaveTournamentAction}>
                  <input type="hidden" name="tournamentId" value={t.tournamentId} />
                  <button
                    type="submit"
                    title={`Salir de ${t.tournament.name}`}
                    className="rounded-md p-1 text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {activeTournamentId && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {predictionsCount}/{matches.length}
                </p>
                <p className="text-sm text-white/50">Pronosticos cargados</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Trophy className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{tournaments.length}</p>
                <p className="text-sm text-white/50">Torneos activos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalPoints}</p>
                <p className="text-sm text-white/50">Puntos totales</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Matchday */}
      {activeTournamentId && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">
            {currentMatchday ? `Fecha ${currentMatchday}` : "Cargando..."}
          </h2>

          {!currentMatchday ? (
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-8 text-center text-white/50">
                No hay fechas disponibles todavia.
              </CardContent>
            </Card>
          ) : (
            <>
              {allFinished && (
                <Card className="mb-4 border-yellow-500/30 bg-yellow-500/5 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Clock className="mx-auto mb-2 h-8 w-8 text-yellow-400" />
                    <p className="text-lg font-semibold text-white">Fecha finalizada</p>
                    <p className="text-sm text-white/50">
                      La proxima fecha estara disponible en 24 horas.
                    </p>
                  </CardContent>
                </Card>
              )}
              <div className="grid gap-4 md:grid-cols-2">
              {matches.map((match: any) => (
                <MatchCard
                  key={match.id}
                  match={{
                    id: match.id,
                    homeTeam: match.homeTeam,
                    awayTeam: match.awayTeam,
                    homeGoals: match.homeGoals,
                    awayGoals: match.awayGoals,
                    date:
                      match.date instanceof Date
                        ? match.date.toISOString()
                        : String(match.date),
                    time: match.time,
                    status: match.status,
                    homeLogo: match.homeLogo,
                    awayLogo: match.awayLogo,
                  }}
                  prediction={match.prediction}
                />
              ))}
            </div>
            </>
          )}
        </div>
      )}

      {/* Postponed Matches from Previous Matchdays */}
      {postponedWithPredictions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CalendarX className="h-5 w-5 text-orange-400" />
            <h2 className="text-xl font-semibold text-orange-400">
              Partidos pendientes de otras fechas
            </h2>
          </div>
          <Card className="border-orange-500/30 bg-orange-500/5 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
                {postponedWithPredictions.map((match: any) => (
                  <MatchCard
                    key={match.id}
                    match={{
                      id: match.id,
                      homeTeam: match.homeTeam,
                      awayTeam: match.awayTeam,
                      homeGoals: match.homeGoals,
                      awayGoals: match.awayGoals,
                      date:
                        match.date instanceof Date
                          ? match.date.toISOString()
                          : String(match.date),
                      time: match.time,
                      status: match.status,
                      homeLogo: match.homeLogo,
                      awayLogo: match.awayLogo,
                    }}
                    prediction={match.prediction}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Join Tournament */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">
            {tournaments.length === 0
              ? "Unite a un torneo"
              : "Unirse a otro torneo"}
          </CardTitle>
          <CardDescription className="text-white/50">
            Ingresa el codigo de invitacion de tu grupo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JoinTournamentForm />
        </CardContent>
      </Card>
    </div>
  );
}
