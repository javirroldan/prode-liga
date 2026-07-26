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
    <Card className="border-white/10 bg-black/60 backdrop-blur-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Iniciar sesion</CardTitle>
        <CardDescription className="text-white/50">Inicia a tu cuenta del prode</CardDescription>
      </CardHeader>
      <CardContent>
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
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/70">Contrasena</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Ingresando..." : "Ingresar"}
          </Button>
          <p className="text-center text-sm text-white/50">
            No tenes cuenta?{" "}
            <Link href="/auth/register" className="text-blue-400 hover:underline">
              Registrate aca
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
