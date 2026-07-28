"use client";

import { useState, useTransition } from "react";
import { submitMatchResult, setMatchStatus, updateLiveScore, resetMatchday } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchdaySelector } from "@/components/fixture/matchday-selector";
import { CheckCircle2, Lock, Save, AlertCircle, Radio } from "lucide-react";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: string;
  date: Date | string;
  time: string | null;
  predictions: Array<{
    homeGoals: number;
    awayGoals: number;
    points: number | null;
    user: { nickname: string };
  }>;
}

export function ResultEntryForm({ matches, currentMatchday }: { matches: Match[]; currentMatchday: number }) {
  const [isPending, startTransition] = useTransition();
  const [localMatches, setLocalMatches] = useState(matches);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGoalsChange = (matchId: string, field: "homeGoals" | "awayGoals", value: string) => {
    const numValue = value === "" ? null : parseInt(value);
    setLocalMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, [field]: numValue } : m
      )
    );
  };

  const handleSubmit = (matchId: string) => {
    const match = localMatches.find((m) => m.id === matchId);
    if (!match || match.homeGoals === null || match.awayGoals === null) {
      setMessage({ type: "error", text: "Carga los goles de ambos equipos" });
      return;
    }

    startTransition(async () => {
      const result = await submitMatchResult(matchId, match.homeGoals!, match.awayGoals!);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: match.status === "FINISHED" ? "Resultado corregido y puntos recalculados" : "Resultado guardado y puntos calculados" });
        setLocalMatches((prev) =>
          prev.map((m) =>
            m.id === matchId
              ? { ...m, status: "FINISHED", homeGoals: match.homeGoals, awayGoals: match.awayGoals }
              : m
          )
        );
      }
    });
  };

  const handleToggleLive = (matchId: string) => {
    const match = localMatches.find((m) => m.id === matchId);
    if (!match) return;

    const wasFinished = match.status === "FINISHED";
    const newStatus = match.status === "LIVE" ? "SCHEDULED" : "LIVE";

    startTransition(async () => {
      const result = await setMatchStatus(matchId, newStatus);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: wasFinished
            ? "Partido reabierto, resultado y puntos reseteados"
            : newStatus === "LIVE"
              ? "Partido marcado como en vivo"
              : "Partido vuelto a pendiente",
        });
        setLocalMatches((prev) =>
          prev.map((m) =>
            m.id === matchId ? { ...m, status: newStatus, homeGoals: null, awayGoals: null } : m
          )
        );
      }
    });
  };

  const handleUpdateLive = (matchId: string) => {
    const match = localMatches.find((m) => m.id === matchId);
    if (!match || match.homeGoals === null || match.awayGoals === null) {
      setMessage({ type: "error", text: "Carga los goles de ambos equipos" });
      return;
    }

    startTransition(async () => {
      const result = await updateLiveScore(matchId, match.homeGoals!, match.awayGoals!);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Parcial actualizado" });
      }
    });
  };

  const handleReset = () => {
    if (!confirm(`¿Borrar todos los pronósticos y resultados de la fecha ${currentMatchday}?`)) return;

    startTransition(async () => {
      const result = await resetMatchday(currentMatchday);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: `Fecha ${currentMatchday} reiniciada` });
        setLocalMatches((prev) =>
          prev.map((m) => ({ ...m, homeGoals: null, awayGoals: null, status: "SCHEDULED" }))
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Button
          onClick={handleReset}
          disabled={isPending}
          variant="destructive"
          size="sm"
          className="w-full sm:w-auto"
        >
          Reiniciar fecha {currentMatchday}
        </Button>
        <MatchdaySelector currentMatchday={currentMatchday} baseUrl="/admin" />
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {localMatches.map((match) => {
          const isFinished = match.status === "FINISHED";
          const isLive = match.status === "LIVE";
          const matchDate = new Date(match.date);
          const dateStr = matchDate.toLocaleDateString("es-AR", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });

          return (
            <Card
              key={match.id}
              className={`border ${
                isFinished ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-black/40"
              } backdrop-blur-sm`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs text-white/50 truncate">
                    {dateStr} {match.time && `- ${match.time}`}
                  </span>
                  {isFinished ? (
                    <Badge variant="outline" className="shrink-0 border-green-500/50 text-green-400 text-xs">
                      <Lock className="mr-1 h-3 w-3" /> Finalizado
                    </Badge>
                  ) : isLive ? (
                    <Badge variant="outline" className="shrink-0 border-red-500/50 text-red-400 text-xs animate-pulse">
                      <Radio className="mr-1 h-3 w-3" /> En vivo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0 border-yellow-500/50 text-yellow-400 text-xs">
                      Pendiente
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium text-sm text-white text-center">
                    {match.homeTeam}
                  </span>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={match.homeGoals ?? ""}
                      onChange={(e) => handleGoalsChange(match.id, "homeGoals", e.target.value)}
                      className="w-14 text-center text-lg font-bold bg-white/10 border-white/20 text-white placeholder:text-white/30"
                      placeholder="-"
                    />
                    <span className="text-white/30">-</span>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={match.awayGoals ?? ""}
                      onChange={(e) => handleGoalsChange(match.id, "awayGoals", e.target.value)}
                      className="w-14 text-center text-lg font-bold bg-white/10 border-white/20 text-white placeholder:text-white/30"
                      placeholder="-"
                    />
                  </div>

                  <span className="font-medium text-sm text-white text-center">
                    {match.awayTeam}
                  </span>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  {isLive ? (
                    <>
                      <Button
                        onClick={() => handleUpdateLive(match.id)}
                        disabled={isPending || match.homeGoals === null || match.awayGoals === null}
                        className="flex-1 w-full sm:w-auto"
                        size="sm"
                        variant="outline"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isPending ? "Guardando..." : "Actualizar parcial"}
                      </Button>
                      <Button
                        onClick={() => handleSubmit(match.id)}
                        disabled={isPending || match.homeGoals === null || match.awayGoals === null}
                        className="w-full sm:w-auto"
                        size="sm"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Finalizar
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleSubmit(match.id)}
                      disabled={isPending || match.homeGoals === null || match.awayGoals === null}
                      className="flex-1 w-full sm:w-auto"
                      size="sm"
                      variant={isFinished ? "outline" : "default"}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isPending ? "Guardando..." : isFinished ? "Corregir resultado" : "Guardar resultado"}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleToggleLive(match.id)}
                    disabled={isPending}
                    variant={isLive ? "destructive" : "outline"}
                    size="sm"
                    className={`w-full sm:w-auto ${isLive ? "" : "border-red-500/50 text-red-400 hover:bg-red-500/10"}`}
                  >
                    <Radio className="mr-1 h-4 w-4" />
                    {isFinished ? "Reabrir partido" : isLive ? "Quitar en vivo" : "En vivo"}
                  </Button>
                </div>

                {isFinished && match.predictions.length > 0 && (
                  <div className="mt-3 text-xs text-white/50">
                    {match.predictions.length} pronosticos cargados
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
