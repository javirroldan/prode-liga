import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-background to-background" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
            <Trophy className="mr-2 h-4 w-4" />
            Liga Profesional Argentina 2026
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">
            Prode <span className="text-green-400">Liga</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Cargá tus pronósticos, competí con tus amigos y demostrá que sabés de fútbol
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/register">
              <Button size="xl" className="text-base">
                Crear cuenta gratis
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="xl" className="text-base">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-500/20 bg-card/50">
            <CardContent className="p-6 text-center">
              <Zap className="mx-auto mb-4 h-10 w-10 text-green-400" />
              <h3 className="mb-2 text-lg font-semibold">Resultados en vivo</h3>
              <p className="text-sm text-muted-foreground">
                Actualización automática de resultados de la Liga Profesional
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-card/50">
            <CardContent className="p-6 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-green-400" />
              <h3 className="mb-2 text-lg font-semibold">Competí con amigos</h3>
              <p className="text-sm text-muted-foreground">
                Creá torneos privados y desafiá a tus amigos
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-card/50">
            <CardContent className="p-6 text-center">
              <Trophy className="mx-auto mb-4 h-10 w-10 text-green-400" />
              <h3 className="mb-2 text-lg font-semibold">Ranking automático</h3>
              <p className="text-sm text-muted-foreground">
                Tabla de posiciones que se actualiza con cada resultado
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-card/50">
            <CardContent className="p-6 text-center">
              <Shield className="mx-auto mb-4 h-10 w-10 text-green-400" />
              <h3 className="mb-2 text-lg font-semibold">Pronósticos seguros</h3>
              <p className="text-sm text-muted-foreground">
                Se bloquean automáticamente al inicio del partido
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scoring Rules */}
      <div className="container mx-auto px-4 pb-20">
        <h2 className="mb-8 text-center text-3xl font-bold">Sistema de puntaje</h2>
        <div className="mx-auto grid max-w-2xl gap-4">
          <Card className="border-green-500/20">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">Resultado exacto</p>
                <p className="text-sm text-muted-foreground">Aciertás los goles de ambos equipos</p>
              </div>
              <span className="text-2xl font-bold text-green-400">12 pts</span>
            </CardContent>
          </Card>
          <Card className="border-green-500/20">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">Ganador o empate</p>
                <p className="text-sm text-muted-foreground">Aciertás quién gana o si hay empate</p>
              </div>
              <span className="text-2xl font-bold text-green-400">5 pts</span>
            </CardContent>
          </Card>
          <Card className="border-green-500/20">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">Goles de un equipo</p>
                <p className="text-sm text-muted-foreground">Aciertás los goles de uno de los dos equipos</p>
              </div>
              <span className="text-2xl font-bold text-green-400">2 pts</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>Prode Liga Profesional Argentina 2026</p>
      </footer>
    </div>
  );
}
