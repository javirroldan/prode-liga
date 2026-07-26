"use client";

import { useActionState } from "react";
import { updatePassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdateState {
  error?: string;
}

export default function UpdatePasswordPage() {
  const [state, formAction, pending] = useActionState<UpdateState, FormData>(
    async (_prev, formData) => {
      const result = await updatePassword(formData);
      return result ?? {};
    },
    {}
  );

  return (
    <Card className="border-white/10 bg-black/60 backdrop-blur-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Nueva contraseña</CardTitle>
        <CardDescription className="text-white/50">
          Creá tu nueva contraseña para acceder al prode
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/70">Nueva contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              minLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Guardando..." : "Guardar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
