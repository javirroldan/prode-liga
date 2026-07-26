import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { MatchCard } from "@/components/fixture/match-card";
import { MatchdaySelector } from "@/components/fixture/matchday-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Calendar } from "lucide-react";

export default async function FixturePage({
  searchParams,
}: {
  searchParams: Promise<{ matchday?: string; status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const currentMatchday = parseInt(params.matchday || "1");
  const statusFilter = params.status || "all";

  // Get tournament
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

  // Get all matches for this matchday
  const where: any = {
    tournamentId: tournament.id,
    matchday: currentMatchday,
  };

  if (statusFilter !== "all") {
    where.status = statusFilter.toUpperCase();
  }

  const matches = await prisma.match.findMany({
    where,
    orderBy: { date: "asc" },
  });

  // Get predictions for current user
  const matchIds = matches.map((m: { id: string }) => m.id);
  const predictions = await prisma.prediction.findMany({
    where: {
      userId: user.id,
      matchId: { in: matchIds },
    },
  });

  // Get max matchday
  const maxMatchday = await prisma.match.aggregate({
    where: { tournamentId: tournament.id },
    _max: { matchday: true },
  });

  const totalMatchdays = maxMatchday._max.matchday || 38;

  // Stats for this matchday
  const totalMatches = await prisma.match.count({
    where: { tournamentId: tournament.id, matchday: currentMatchday },
  });

  const finishedMatches = await prisma.match.count({
    where: {
      tournamentId: tournament.id,
      matchday: currentMatchday,
      status: "FINISHED",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Fixture</h1>
        <p className="text-white/50">
          {tournament.name} - Fecha {currentMatchday}
        </p>
      </div>

      {/* Stats */}
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

      {/* Matchday Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Fecha {currentMatchday}</h2>
        <MatchdaySelector currentMatchday={currentMatchday} totalMatchdays={totalMatchdays} baseUrl="/fixture" />
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", "scheduled", "finished"].map((status) => (
          <a
            key={status}
            href={`/fixture?matchday=${currentMatchday}&status=${status}`}
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-white/5 text-white/50 hover:text-white border border-white/10"
            }`}
          >
            {status === "all"
              ? "Todos"
              : status === "scheduled"
              ? "Pendientes"
              : "Finalizados"}
          </a>
        ))}
      </div>

      {/* Matches Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {matches.length === 0 ? (
          <Card className="col-span-full border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="p-8 text-center text-white/50">
              No hay partidos para esta fecha
            </CardContent>
          </Card>
        ) : (
          matches.map((match: { id: string; date: Date; homeTeam: string; awayTeam: string; homeGoals: number | null; awayGoals: number | null; status: string; homeLogo?: string | null; awayLogo?: string | null; time?: string | null }) => {
            const prediction = predictions.find((p: { matchId: string }) => p.matchId === match.id);
            return (
              <MatchCard
                key={match.id}
                match={{
                  ...match,
                  date: match.date.toISOString(),
                }}
                prediction={prediction
                  ? {
                      homeGoals: prediction.homeGoals,
                      awayGoals: prediction.awayGoals,
                      points: prediction.points,
                    }
                  : null}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
