import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { Trophy, Medal, TrendingUp, Target } from "lucide-react";

function getPositionIcon(position: number) {
  if (position === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
  if (position === 2) return <Medal className="h-5 w-5 text-gray-300" />;
  if (position === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{position}</span>;
}

function getPositionLabel(points: number): string {
  if (points >= 100) return "ProdeMaster";
  if (points >= 60) return "Experto";
  if (points >= 30) return "Fanático";
  if (points >= 10) return "Entusiasta";
  return "Debutante";
}

function getPositionColor(points: number): string {
  if (points >= 100) return "text-yellow-400";
  if (points >= 60) return "text-green-400";
  if (points >= 30) return "text-blue-400";
  if (points >= 10) return "text-purple-400";
  return "text-muted-foreground";
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
        <h1 className="text-3xl font-bold">Ranking</h1>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
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
      <div>
        <h1 className="text-3xl font-bold">Ranking</h1>
        <p className="text-muted-foreground">{tournament.name}</p>
      </div>

      {userParticipation && (
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <Target className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Tu posicion</p>
                <p className="text-2xl font-bold">
                  {userPosition > 0 ? `#${userPosition}` : "-"} / {totalParticipants}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tus puntos</p>
                <p className="text-2xl font-bold text-green-400">
                  {userParticipation.totalPoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <Trophy className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalParticipants}</p>
              <p className="text-sm text-muted-foreground">Participantes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{averagePoints}</p>
              <p className="text-sm text-muted-foreground">Promedio puntos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <Medal className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {rankings[0]?.user.nickname || "-"}
              </p>
              <p className="text-sm text-muted-foreground">Lider actual</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tabla de posiciones</CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay participantes en este torneo
            </p>
          ) : (
            <div className="space-y-2">
              {rankings.map((rank: { id: string; userId: string; totalPoints: number; user: { nickname: string; name: string; avatar: string | null } }, index: number) => (
                <div key={rank.id}>
                  <div
                    className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                      rank.userId === user.id
                        ? "bg-green-500/10 border border-green-500/20"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <div className="w-8 flex justify-center">
                      {getPositionIcon(index + 1)}
                    </div>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-green-500/10 text-green-400 text-sm font-bold">
                        {rank.user.nickname.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {rank.user.nickname}
                        {rank.userId === user.id && (
                          <span className="ml-2 text-xs text-green-400">(vos)</span>
                        )}
                      </p>
                      <p className={`text-xs ${getPositionColor(rank.totalPoints)}`}>
                        {getPositionLabel(rank.totalPoints)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{rank.totalPoints}</p>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                  {index < rankings.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
