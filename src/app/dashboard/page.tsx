import { getMatchdayPredictions } from "@/actions/predictions";
import { getUserTournaments, joinTournament } from "@/actions/tournaments";
import { getCurrentUser } from "@/actions/auth";
import { MatchCard } from "@/components/fixture/match-card";
import { MatchdaySelector } from "@/components/fixture/matchday-selector";
import { JoinTournamentForm } from "@/components/shared/join-tournament-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Trophy, Target, TrendingUp } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ matchday?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const currentMatchday = parseInt(params.matchday || "1");

  const [matches, tournaments] = await Promise.all([
    getMatchdayPredictions(currentMatchday),
    getUserTournaments(),
  ]);

  const predictionsCount = matches.filter((m: { prediction: unknown }) => m.prediction).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Hola, <span className="text-green-400">{user.nickname}</span>
        </h1>
        <p className="text-muted-foreground">
          Fecha {currentMatchday} de la Liga Profesional Argentina
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <Target className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{predictionsCount}/{matches.length}</p>
              <p className="text-sm text-muted-foreground">Pronósticos cargados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <Trophy className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tournaments.length}</p>
              <p className="text-sm text-muted-foreground">Torneos activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {tournaments.reduce((sum: number, t: { totalPoints: number }) => sum + t.totalPoints, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Puntos totales</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Join Tournament */}
      {tournaments.length === 0 && (
        <Card className="border-green-500/20">
          <CardHeader>
            <CardTitle>Unite a un torneo</CardTitle>
            <CardDescription>Ingresá el código de invitación de tu grupo</CardDescription>
          </CardHeader>
          <CardContent>
            <JoinTournamentForm />
          </CardContent>
        </Card>
      )}

      {/* Matchday */}
      <div>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Fecha {currentMatchday}</h2>
          <MatchdaySelector currentMatchday={currentMatchday} baseUrl="/dashboard" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {matches.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center text-muted-foreground">
                No hay partidos para esta fecha
              </CardContent>
            </Card>
          ) : (
            matches.map((match) => (
              <MatchCard
                key={match.id}
                match={{
                  id: match.id,
                  homeTeam: match.homeTeam,
                  awayTeam: match.awayTeam,
                  homeGoals: match.homeGoals,
                  awayGoals: match.awayGoals,
                  date: match.date instanceof Date ? match.date.toISOString() : String(match.date),
                  time: match.time,
                  status: match.status,
                  homeLogo: match.homeLogo,
                  awayLogo: match.awayLogo,
                }}
                prediction={match.prediction}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
