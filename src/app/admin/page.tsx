import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  SyncMatchdayButton, 
  SyncLiveButton, 
  RecalculateButton 
} from "@/components/admin/admin-actions";
import { 
  Database, 
  RefreshCw, 
  Calculator, 
  Users, 
  Trophy,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface UserWithoutPrediction {
  name: string;
  nickname: string;
}

async function getUsersWithoutPrediction(matchday: number): Promise<UserWithoutPrediction[]> {
  const tournament = await prisma.tournament.findFirst({
    where: { isActive: true },
  });

  if (!tournament) return [];

  const matches = await prisma.match.findMany({
    where: { matchday, tournamentId: tournament.id },
  });

  const matchIds = matches.map((m: { id: string }) => m.id);

  const usersWithPrediction = await prisma.prediction.findMany({
    where: {
      matchId: { in: matchIds },
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  const userIdsWithPrediction = usersWithPrediction.map((p: { userId: string }) => p.userId);

  const allParticipants = await prisma.participation.findMany({
    where: { tournamentId: tournament.id },
    include: {
      user: {
        select: {
          name: true,
          nickname: true,
        },
      },
    },
  });

  return allParticipants
    .filter((p: { userId: string }) => !userIdsWithPrediction.includes(p.userId))
    .map((p: { user: UserWithoutPrediction }) => p.user);
}

export default async function AdminPage() {
  const [
    totalUsers,
    totalTournaments,
    totalMatches,
    totalPredictions,
    activeTournament,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.tournament.count(),
    prisma.match.count(),
    prisma.prediction.count(),
    prisma.tournament.findFirst({ where: { isActive: true } }),
  ]);

  const currentMatchday = 1;
  const usersWithoutPrediction = await getUsersWithoutPrediction(currentMatchday);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Panel de Administracion</h1>
        <p className="text-muted-foreground">Gestiona el prode de la Liga Profesional</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Usuarios</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <Trophy className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalTournaments}</p>
              <p className="text-sm text-muted-foreground">Torneos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <Database className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalMatches}</p>
              <p className="text-sm text-muted-foreground">Partidos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPredictions}</p>
              <p className="text-sm text-muted-foreground">Pronosticos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sincronizacion
            </CardTitle>
            <CardDescription>
              Actualizar datos desde la API de futbol
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTournament && (
              <p className="text-sm text-muted-foreground">
                Torneo activo: <span className="font-medium text-foreground">{activeTournament.name}</span>
              </p>
            )}
            <SyncMatchdayButton matchday={1} />
            <SyncLiveButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculo de puntos
            </CardTitle>
            <CardDescription>
              Recalcular puntajes de todos los participantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Recalcula los puntos despues de corregir resultados o si hay inconsistencias.
            </p>
            <RecalculateButton />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Sin pronostico - Fecha {currentMatchday}
            </CardTitle>
            <CardDescription>
              Usuarios que aun no cargaron sus predicciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersWithoutPrediction.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-4 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Todos los participantes cargaron sus pronosticos
              </div>
            ) : (
              <div className="space-y-2">
                {usersWithoutPrediction.map((user: UserWithoutPrediction, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3"
                  >
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <div>
                      <p className="font-medium">{user.nickname}</p>
                      <p className="text-xs text-muted-foreground">{user.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
