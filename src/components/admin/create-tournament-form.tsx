"use client";

import { useState, useTransition, useEffect } from "react";
import { createTournament, deleteTournament } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Plus, CheckCircle2, AlertCircle, Copy, Trash2 } from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  season: string;
  inviteCode: string;
}

export function CreateTournamentForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string; code?: string } | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    const res = await fetch("/api/tournaments");
    const data = await res.json();
    setTournaments(data.tournaments || []);
  };

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
        fetchTournaments();
      }
    });
  };

  const handleDelete = (tournamentId: string) => {
    startTransition(async () => {
      const result = await deleteTournament(tournamentId);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Torneo eliminado" });
        setDeleteConfirm(null);
        fetchTournaments();
      }
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="space-y-4">
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
                  onClick={() => copyCode(message.code!)}
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

      {tournaments.length > 0 && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="h-5 w-5" />
              Torneos Existentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-white">{tournament.name}</p>
                      <p className="text-sm text-white/50">
                        Temporada: {tournament.season}
                      </p>
                    </div>
                    <button
                      onClick={() => copyCode(tournament.inviteCode)}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 px-2 py-1 text-sm font-bold text-blue-400 hover:bg-blue-500/30 cursor-pointer"
                    >
                      {tournament.inviteCode}
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <div>
                    {deleteConfirm === tournament.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-400">¿Eliminar?</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(tournament.id)}
                          disabled={isPending}
                        >
                          {isPending ? "Eliminando..." : "Si"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteConfirm(null)}
                          disabled={isPending}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(tournament.id)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
