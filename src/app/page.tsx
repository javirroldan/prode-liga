import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { SessionRecovery } from "@/components/shared/session-recovery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Zap, Shield } from "lucide-react";

export default async function Home() {
  // Con cookies vivas: directo al dashboard sin flash. Sin cookies pero con
  // backup localStorage, <SessionRecovery /> restaura y redirige en cliente.
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <SessionRecovery />
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
            <Trophy className="mr-2 h-4 w-4" />
            Liga Profesional Argentina 2026
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">
            Prode <span className="text-blue-400">Liga</span>
          </h1>
          <p className="mb-8 text-lg text-white/60 md:text-xl">
            Carga tus pronosticos, compete con tus amigos y demuestra que sabes de futbol
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/register">
              <Button size="xl" className="text-base">
                Crear cuenta gratis
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="xl" className="text-base border-white/20 text-white hover:bg-white/10">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Zap className="mx-auto mb-4 h-10 w-10 text-blue-400" />
              <h3 className="mb-2 text-lg font-semibold text-white">Resultados en vivo</h3>
              <p className="text-sm text-white/50">
                Actualizacion automatica de resultados de la Liga Profesional
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-blue-400" />
              <h3 className="mb-2 text-lg font-semibold text-white">Competi con amigos</h3>
              <p className="text-sm text-white/50">
                Crea torneos privados y desafia a tus amigos
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Trophy className="mx-auto mb-4 h-10 w-10 text-blue-400" />
              <h3 className="mb-2 text-lg font-semibold text-white">Ranking automatico</h3>
              <p className="text-sm text-white/50">
                Tabla de posiciones que se actualiza con cada resultado
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Shield className="mx-auto mb-4 h-10 w-10 text-blue-400" />
              <h3 className="mb-2 text-lg font-semibold text-white">Pronosticos seguros</h3>
              <p className="text-sm text-white/50">
                Se bloquean automaticamente al inicio del partido
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scoring Rules */}
      <div className="container mx-auto px-4 pb-20">
        <h2 className="mb-8 text-center text-3xl font-bold text-white">Sistema de puntaje</h2>
        <div className="mx-auto grid max-w-2xl gap-4">
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-white">Resultado exacto</p>
                <p className="text-sm text-white/50">Aciertas los goles de ambos equipos</p>
              </div>
              <span className="text-2xl font-bold text-blue-400">12 pts</span>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-white">Ganador o empate</p>
                <p className="text-sm text-white/50">Aciertas quien gana o si hay empate</p>
              </div>
              <span className="text-2xl font-bold text-blue-400">5 pts</span>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-white">Goles de un equipo</p>
                <p className="text-sm text-white/50">Aciertas los goles de uno de los dos equipos</p>
              </div>
              <span className="text-2xl font-bold text-blue-400">2 pts</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        <p>Prode Liga Profesional Argentina 2026</p>
      </footer>
    </div>
  );
}
