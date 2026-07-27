import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import {
  getRankingWithTiebreak,
  getMatchdayRanking,
  getUserStats,
  getAvailableMatchdays,
  type RankingEntry,
} from "@/actions/tournaments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { Trophy, Medal, TrendingUp, Target, BarChart3 } from "lucide-react";
import { getCurrentMatchday } from "@/lib/match-utils";

function getPositionStyle(position: number) {
  if (position === 1) return { bg: "bg-yellow-500", text: "text-yellow-500", ring: "ring-yellow-500/30" };
  if (position === 2) return { bg: "bg-slate-300", text: "text-slate-300", ring: "ring-slate-300/30" };
  if (position === 3) return { bg: "bg-amber-600", text: "text-amber-600", ring: "ring-amber-600/30" };
  return { bg: "bg-white/10", text: "text-white/50", ring: "" };
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`rounded-lg border ${color} p-3 text-center`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs opacity-70">{label}</p>
    </div>
  );
}

function RankingRow({
  rank,
  position,
  isCurrentUser,
  showBreakdown,
}: {
  rank: RankingEntry;
  position: number;
  isCurrentUser: boolean;
  showBreakdown: boolean;
}) {
  const posStyle = getPositionStyle(position);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl p-3 transition-all",
        isCurrentUser
          ? "bg-blue-500/10 border border-blue-500/30"
          : "bg-white/5 hover:bg-white/10"
      )}
    >
      {/* Position */}
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
          position <= 3 ? posStyle.bg + " text-black" : posStyle.bg + " " + posStyle.text
        )}
      >
        {position}
      </div>

      {/* Avatar */}
      <Avatar className="h-10 w-10 border-2 border-white/10">
        <AvatarFallback className="bg-blue-500/20 text-blue-400 text-sm font-bold">
          {rank.nickname.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">
          {rank.nickname}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-blue-400">(vos)</span>
          )}
        </p>
        {showBreakdown && (
          <p className="text-xs text-white/40">
            {rank.exact12}x12 · {rank.winner7}x7 · {rank.winner5}x5 · {rank.goals2}x2
          </p>
        )}
      </div>

      {/* Points */}
      <div className="text-right">
        <p className="text-lg font-bold text-white">{rank.totalPoints}</p>
        <p className="text-xs text-white/40">pts</p>
      </div>
    </div>
  );
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const selectedFecha = params.fecha ? parseInt(params.fecha) : null;

  const tournament = await prisma.tournament.findFirst({
    where: { isActive: true },
  });

  if (!tournament) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Ranking</h1>
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-8 text-center text-white/50">
            No hay torneos activos. Unite a uno desde el dashboard.
          </CardContent>
        </Card>
      </div>
    );
  }

  const [generalRanking, availableMatchdays, userStats, currentMatchday] = await Promise.all([
    getRankingWithTiebreak(tournament.id),
    getAvailableMatchdays(tournament.id),
    getUserStats(tournament.id, user.id),
    getCurrentMatchday(tournament.id),
  ]);

  const matchdayToLoad = selectedFecha || currentMatchday || availableMatchdays[0] || 1;

  let matchdayRanking: RankingEntry[] = [];
  if (matchdayToLoad) {
    matchdayRanking = await getMatchdayRanking(tournament.id, matchdayToLoad);
  }

  const userGeneralPos = generalRanking.findIndex((r) => r.userId === user.id) + 1;
  const userEntry = generalRanking.find((r) => r.userId === user.id);
  const totalParticipants = generalRanking.length;
  const averagePoints =
    totalParticipants > 0
      ? Math.round(
          generalRanking.reduce((sum, r) => sum + r.totalPoints, 0) / totalParticipants
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Ranking</h1>
        <p className="text-white/50">{tournament.name}</p>
      </div>

      {/* User position card */}
      {userEntry && (
        <Card className="border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/20 p-3">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/50">Tu posicion</p>
                <p className="text-2xl font-bold text-white">
                  {userGeneralPos > 0 ? `#${userGeneralPos}` : "-"} / {totalParticipants}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/50">Tus puntos</p>
                <p className="text-2xl font-bold text-blue-400">
                  {userEntry.totalPoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Trophy className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalParticipants}</p>
              <p className="text-sm text-white/50">Participantes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{averagePoints}</p>
              <p className="text-sm text-white/50">Promedio puntos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Medal className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {generalRanking[0]?.nickname || "-"}
              </p>
              <p className="text-sm text-white/50">Lider actual</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="general" className="data-[state=active]:bg-blue-500/20">
            General
          </TabsTrigger>
          <TabsTrigger value="fecha" className="data-[state=active]:bg-blue-500/20">
            Por Fecha
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-blue-500/20">
            <BarChart3 className="mr-1 h-4 w-4" />
            Estadisticas
          </TabsTrigger>
        </TabsList>

        {/* General tab */}
        <TabsContent value="general">
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Tabla General</CardTitle>
            </CardHeader>
            <CardContent>
              {generalRanking.length === 0 ? (
                <p className="text-center text-white/50 py-8">
                  No hay participantes en este torneo
                </p>
              ) : (
                <div className="space-y-2">
                  {generalRanking.map((rank, index) => (
                    <RankingRow
                      key={rank.userId}
                      rank={rank}
                      position={index + 1}
                      isCurrentUser={rank.userId === user.id}
                      showBreakdown={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Per-matchday tab */}
        <TabsContent value="fecha">
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">
                Fecha {matchdayToLoad}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date selector */}
              <div className="flex flex-wrap gap-2">
                {availableMatchdays.map((md) => (
                  <a
                    key={md}
                    href={`/ranking?fecha=${md}`}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      md === matchdayToLoad
                        ? "bg-blue-500 text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {md}
                  </a>
                ))}
              </div>

              {/* Matchday ranking */}
              {matchdayRanking.length === 0 ? (
                <p className="text-center text-white/50 py-8">
                  No hay resultados para esta fecha
                </p>
              ) : (
                <div className="space-y-2">
                  {matchdayRanking.map((rank, index) => (
                    <RankingRow
                      key={rank.userId}
                      rank={rank}
                      position={index + 1}
                      isCurrentUser={rank.userId === user.id}
                      showBreakdown={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats tab */}
        <TabsContent value="stats">
          <div className="space-y-4">
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Tus estadisticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <StatBadge label="+12 Exacto" count={userStats.exact12} color="border-yellow-500/30 text-yellow-400" />
                  <StatBadge label="+7 Ganador+Goles" count={userStats.winner7} color="border-green-500/30 text-green-400" />
                  <StatBadge label="+5 Ganador" count={userStats.winner5} color="border-blue-500/30 text-blue-400" />
                  <StatBadge label="+2 Un Equipo" count={userStats.goals2} color="border-orange-500/30 text-orange-400" />
                  <StatBadge label="0 Sin acierto" count={userStats.zero} color="border-white/10 text-white/40" />
                </div>
              </CardContent>
            </Card>

            {/* All users stats table */}
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Estadisticas de todos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-2 text-left text-white/50 font-medium">#</th>
                        <th className="pb-2 text-left text-white/50 font-medium">Jugador</th>
                        <th className="pb-2 text-center text-white/50 font-medium">Pts</th>
                        <th className="pb-2 text-center text-yellow-400 font-medium">12</th>
                        <th className="pb-2 text-center text-green-400 font-medium">7</th>
                        <th className="pb-2 text-center text-blue-400 font-medium">5</th>
                        <th className="pb-2 text-center text-orange-400 font-medium">2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generalRanking.map((rank, index) => (
                        <tr
                          key={rank.userId}
                          className={cn(
                            "border-b border-white/5",
                            rank.userId === user.id && "bg-blue-500/10"
                          )}
                        >
                          <td className="py-2.5 text-white/50">{index + 1}</td>
                          <td className="py-2.5 font-medium text-white">
                            {rank.nickname}
                            {rank.userId === user.id && (
                              <span className="ml-1.5 text-xs text-blue-400">(vos)</span>
                            )}
                          </td>
                          <td className="py-2.5 text-center font-bold text-white">{rank.totalPoints}</td>
                          <td className="py-2.5 text-center text-yellow-400">{rank.exact12}</td>
                          <td className="py-2.5 text-center text-green-400">{rank.winner7}</td>
                          <td className="py-2.5 text-center text-blue-400">{rank.winner5}</td>
                          <td className="py-2.5 text-center text-orange-400">{rank.goals2}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
