"use client";

import { useActionState } from "react";
import { register } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface RegisterState {
  error?: string;
}

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    async (_prev, formData) => {
      const result = await register(formData);
      return result ?? {};
    },
    {}
  );

  return (
    <Card className="border-green-500/20 bg-card/80 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <CardDescription>Registrate para jugar al prode</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              name="name"
              placeholder="Juan Perez"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              name="nickname"
              placeholder="juanprode"
              required
              minLength={3}
            />
          </div>
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
              placeholder="Minimo 6 caracteres"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Creando..." : "Crear cuenta"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Ya tenes cuenta?{" "}
            <Link href="/auth/login" className="text-green-400 hover:underline">
              Inicia aca
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
