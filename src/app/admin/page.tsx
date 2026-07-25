import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultEntryForm } from "@/components/admin/result-entry-form";
import { 
  Users, 
  Trophy,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ matchday?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser?.isAdmin) redirect("/dashboard");

  const params = await searchParams;
  const currentMatchday = parseInt(params.matchday || "1");

  const [
    totalUsers,
    totalTournaments,
    totalMatches,
    totalFinished,
    activeTournament,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.tournament.count(),
    prisma.match.count(),
    prisma.match.count({ where: { status: "FINISHED" } }),
    prisma.tournament.findFirst({ where: { isActive: true } }),
  ]);

  const matches = await prisma.match.findMany({
    where: { matchday: currentMatchday },
    orderBy: { date: "asc" },
    include: {
      predictions: {
        include: {
          user: { select: { nickname: true } },
        },
      },
    },
  });

  const matchesForForm = matches.map((m) => ({
    id: m.id,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeGoals: m.homeGoals,
    awayGoals: m.awayGoals,
    status: m.status,
    date: m.date,
    time: m.time,
    predictions: m.predictions.map((p) => ({
      homeGoals: p.homeGoals,
      awayGoals: p.awayGoals,
      points: p.points,
      user: { nickname: p.user.nickname },
    })),
  }));

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
              <ClipboardList className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalFinished}/{totalMatches}</p>
              <p className="text-sm text-muted-foreground">Resultados cargados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalMatches - totalFinished}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Cargar Resultados - Fecha {currentMatchday}
          </CardTitle>
          <CardDescription>
            Ingresá los goles de cada partido. Una vez guardado, no se puede modificar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResultEntryForm matches={matchesForForm} currentMatchday={currentMatchday} />
        </CardContent>
      </Card>
    </div>
  );
}
