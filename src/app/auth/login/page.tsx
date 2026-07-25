"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface LoginState {
  error?: string;
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    async (_prev, formData) => {
      const result = await login(formData);
      return result ?? {};
    },
    {}
  );

  return (
    <Card className="border-green-500/20 bg-card/80 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Iniciar sesion</CardTitle>
        <CardDescription>Inicia a tu cuenta del prode</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contrasena</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Ingresando..." : "Ingresar"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No tenes cuenta?{" "}
            <Link href="/auth/register" className="text-green-400 hover:underline">
              Registrate aca
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
