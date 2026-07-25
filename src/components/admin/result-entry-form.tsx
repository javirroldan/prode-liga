"use client";

import { useState, useTransition } from "react";
import { submitMatchResult } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchdaySelector } from "@/components/fixture/matchday-selector";
import { CheckCircle2, Lock, Save, AlertCircle } from "lucide-react";

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
      setMessage({ type: "error", text: "Cargá los goles de ambos equipos" });
      return;
    }

    startTransition(async () => {
      const result = await submitMatchResult(matchId, match.homeGoals!, match.awayGoals!);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Resultado guardado y puntos calculados" });
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

  return (
    <div className="space-y-4">
      <MatchdaySelector currentMatchday={currentMatchday} baseUrl="/admin" />

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
                isFinished ? "border-green-500/30 bg-green-500/5" : "border-white/10"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">
                    {dateStr} {match.time && `- ${match.time}`}
                  </span>
                  {isFinished ? (
                    <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
                      <Lock className="mr-1 h-3 w-3" /> Finalizado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                      Pendiente
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex-1 text-right font-medium text-sm">
                    {match.homeTeam}
                  </span>

                  {isFinished ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-400">{match.homeGoals}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-2xl font-bold text-green-400">{match.awayGoals}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={match.homeGoals ?? ""}
                        onChange={(e) => handleGoalsChange(match.id, "homeGoals", e.target.value)}
                        className="w-16 text-center text-lg font-bold"
                        placeholder="-"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={match.awayGoals ?? ""}
                        onChange={(e) => handleGoalsChange(match.id, "awayGoals", e.target.value)}
                        className="w-16 text-center text-lg font-bold"
                        placeholder="-"
                      />
                    </div>
                  )}

                  <span className="flex-1 text-left font-medium text-sm">
                    {match.awayTeam}
                  </span>
                </div>

                {!isFinished && (
                  <Button
                    onClick={() => handleSubmit(match.id)}
                    disabled={isPending || match.homeGoals === null || match.awayGoals === null}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isPending ? "Guardando..." : "Guardar resultado"}
                  </Button>
                )}

                {isFinished && match.predictions.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {match.predictions.length} pronósticos cargados
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
