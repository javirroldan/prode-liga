"use client";

import { useState, useTransition } from "react";
import { createTournament } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Plus, CheckCircle2, AlertCircle, Copy } from "lucide-react";

export function CreateTournamentForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string; code?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createTournament(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: `Torneo creado. Codigo de invitacion:`,
          code: result?.inviteCode,
        });
        e.currentTarget.reset();
      }
    });
  };

  const copyCode = () => {
    if (message?.code) {
      navigator.clipboard.writeText(message.code);
    }
  };

  return (
    <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Trophy className="h-5 w-5" />
          Crear Torneo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg p-3 ${
              message.type === "success"
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
            {message.code && (
              <button
                onClick={copyCode}
                className="ml-1 inline-flex items-center gap-1 rounded-md bg-green-500/20 px-2 py-0.5 text-sm font-bold text-green-400 hover:bg-green-500/30 cursor-pointer"
              >
                {message.code}
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            name="name"
            placeholder="Nombre del torneo"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            required
          />
          <Input
            name="season"
            placeholder="Temporada (ej: 2026)"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 sm:w-40"
            required
          />
          <Button type="submit" disabled={isPending} className="shrink-0">
            <Plus className="mr-1 h-4 w-4" />
            {isPending ? "Creando..." : "Crear"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
