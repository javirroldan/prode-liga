"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface ForgotState {
  error?: string;
  success?: string;
}

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<ForgotState, FormData>(
    async (_prev, formData) => {
      const result = await forgotPassword(formData);
      return result ?? {};
    },
    {}
  );

  return (
    <Card className="border-white/10 bg-black/60 backdrop-blur-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Recuperar contraseña</CardTitle>
        <CardDescription className="text-white/50">
          Ingresá tu email y te enviaremos un link para crear una nueva contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.success ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              {state.success}
            </div>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full border-white/20 text-white">
                Volver al login
              </Button>
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={pending}>
              {pending ? "Enviando..." : "Enviar link de recuperación"}
            </Button>
            <p className="text-center text-sm text-white/50">
              <Link href="/auth/login" className="text-blue-400 hover:underline">
                Volver al login
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
