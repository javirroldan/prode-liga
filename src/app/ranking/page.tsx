import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { redirect } from "next/navigation";
import { Trophy, Medal, TrendingUp, Target } from "lucide-react";

function getPositionStyle(position: number) {
  if (position === 1) return { bg: "bg-yellow-500", text: "text-yellow-500", ring: "ring-yellow-500/30" };
  if (position === 2) return { bg: "bg-slate-300", text: "text-slate-300", ring: "ring-slate-300/30" };
  if (position === 3) return { bg: "bg-amber-600", text: "text-amber-600", ring: "ring-amber-600/30" };
  return { bg: "bg-white/10", text: "text-white/50", ring: "" };
}

function getPositionLabel(points: number): string {
  if (points >= 100) return "ProdeMaster";
  if (points >= 60) return "Experto";
  if (points >= 30) return "Fanatico";
  if (points >= 10) return "Entusiasta";
  return "Debutante";
}

export default async function RankingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

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

  const rankings = await prisma.participation.findMany({
    where: { tournamentId: tournament.id },
    include: {
      user: {
        select: {
          name: true,
          nickname: true,
          avatar: true,
        },
      },
    },
    orderBy: { totalPoints: "desc" },
  });

  const userPosition = rankings.findIndex((r: { userId: string }) => r.userId === user.id) + 1;
  const userParticipation = rankings.find((r: { userId: string }) => r.userId === user.id);

  const totalParticipants = rankings.length;
  const averagePoints =
    totalParticipants > 0
      ? Math.round(
          rankings.reduce((sum: number, r: { totalPoints: number }) => sum + r.totalPoints, 0) / totalParticipants
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
      {userParticipation && (
        <Card className="border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/20 p-3">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/50">Tu posicion</p>
                <p className="text-2xl font-bold text-white">
                  {userPosition > 0 ? `#${userPosition}` : "-"} / {totalParticipants}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/50">Tus puntos</p>
                <p className="text-2xl font-bold text-blue-400">
                  {userParticipation.totalPoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
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
                {rankings[0]?.user.nickname || "-"}
              </p>
              <p className="text-sm text-white/50">Lider actual</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings table */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Tabla de posiciones</CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <p className="text-center text-white/50 py-8">
              No hay participantes en este torneo
            </p>
          ) : (
            <div className="space-y-2">
              {rankings.map((rank: { id: string; userId: string; totalPoints: number; user: { nickname: string; name: string; avatar: string | null } }, index: number) => {
                const posStyle = getPositionStyle(index + 1);
                const isCurrentUser = rank.userId === user.id;

                return (
                  <div
                    key={rank.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-3 transition-all",
                      isCurrentUser
                        ? "bg-blue-500/10 border border-blue-500/30"
                        : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    {/* Position number */}
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                        index < 3 ? posStyle.bg + " text-black" : posStyle.bg + " " + posStyle.text
                      )}
                    >
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-10 w-10 border-2 border-white/10">
                      <AvatarFallback className="bg-blue-500/20 text-blue-400 text-sm font-bold">
                        {rank.user.nickname.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {rank.user.nickname}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-blue-400">(vos)</span>
                        )}
                      </p>
                      <p className="text-xs text-white/40">
                        {getPositionLabel(rank.totalPoints)}
                      </p>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{rank.totalPoints}</p>
                      <p className="text-xs text-white/40">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
