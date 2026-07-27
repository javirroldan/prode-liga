import { createClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const code = params.code;

  if (!code) {
    return (
      <Card className="border-white/10 bg-black/60 backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Enlace inválido</CardTitle>
          <CardDescription className="text-white/50">
            El enlace de recuperación no es válido o ya expiró.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/forgot-password">
            <Button variant="outline" className="w-full border-white/20 text-white">
              Solicitar nuevo enlace
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return (
      <Card className="border-white/10 bg-black/60 backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Enlace expirado</CardTitle>
          <CardDescription className="text-white/50">
            El enlace de recuperación ya no es válido. Solicitá uno nuevo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/forgot-password">
            <Button variant="outline" className="w-full border-white/20 text-white">
              Solicitar nuevo enlace
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <UpdatePasswordForm />;
}
