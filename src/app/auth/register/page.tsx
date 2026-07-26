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
    <Card className="border-white/10 bg-black/60 backdrop-blur-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Crear cuenta</CardTitle>
        <CardDescription className="text-white/50">Registrate para jugar al prode</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/70">Nombre completo</Label>
            <Input
              id="name"
              name="name"
              placeholder="Juan Perez"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-white/70">Nickname</Label>
            <Input
              id="nickname"
              name="nickname"
              placeholder="juanprode"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              required
              minLength={3}
            />
          </div>
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
              placeholder="Minimo 6 caracteres"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Creando..." : "Crear cuenta"}
          </Button>
          <p className="text-center text-sm text-white/50">
            Ya tenes cuenta?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:underline">
              Inicia aca
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
