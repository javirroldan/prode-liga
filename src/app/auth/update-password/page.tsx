import { createClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Card className="border-white/10 bg-black/60 backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Sesión expirada</CardTitle>
          <CardDescription className="text-white/50">
            El enlace ya no es válido. Solicitá uno nuevo.
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
