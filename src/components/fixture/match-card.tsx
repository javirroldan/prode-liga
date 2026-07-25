"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { submitPrediction } from "@/actions/predictions";
import { isMatchLocked } from "@/lib/match-utils";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, Lock } from "lucide-react";

interface MatchCardProps {
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string | null;
    awayLogo?: string | null;
    homeGoals: number | null;
    awayGoals: number | null;
    date: string;
    time?: string | null;
    status: string;
  };
  prediction: {
    homeGoals: number;
    awayGoals: number;
    points?: number | null;
  } | null;
}

export function MatchCard({ match, prediction }: MatchCardProps) {
  const [homeGoals, setHomeGoals] = useState(
    prediction?.homeGoals?.toString() ?? ""
  );
  const [awayGoals, setAwayGoals] = useState(
    prediction?.awayGoals?.toString() ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";
  const isTimeLocked = isMatchLocked(new Date(match.date), match.time ?? null);
  const isLocked = match.status !== "SCHEDULED" || isTimeLocked;

  const matchDate = new Date(match.date);
  const dateStr = matchDate.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  async function handleSubmit() {
    if (saving || isLocked) return;
    setSaving(true);

    const formData = new FormData();
    formData.append("matchId", match.id);
    formData.append("homeGoals", homeGoals);
    formData.append("awayGoals", awayGoals);

    const result = await submitPrediction(formData);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <Card className={cn(
      "transition-all duration-300",
      isLocked && "opacity-75",
      isLive && "border-red-500/50 shadow-red-500/10 shadow-lg",
      isFinished && "border-green-500/30",
      saved && "border-green-400/50"
    )}>
      <CardContent className="p-4">
        {/* Status & Date */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge variant="destructive" className="animate-pulse gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                EN VIVO
              </Badge>
            )}
            {isFinished && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                FINALIZADO
              </Badge>
            )}
            {isLocked && !isLive && !isFinished && (
              <Badge variant="warning" className="gap-1">
                <Lock className="h-3 w-3" />
                BLOQUEADO
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {dateStr} {match.time || ""}
          </div>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Home team */}
          <div className="text-right">
            <p className="font-semibold text-sm md:text-base">{match.homeTeam}</p>
          </div>

          {/* Score / Prediction */}
          <div className="flex flex-col items-center gap-2">
            {isFinished || isLive ? (
              <div className="flex items-center gap-2 text-2xl font-bold">
                <span className="min-w-[2ch] text-center">{match.homeGoals ?? "-"}</span>
                <span className="text-muted-foreground">-</span>
                <span className="min-w-[2ch] text-center">{match.awayGoals ?? "-"}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={homeGoals}
                  onChange={(e) => setHomeGoals(e.target.value)}
                  disabled={isLocked}
                  className="h-12 w-14 text-center text-lg font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
                <span className="text-xl font-bold text-muted-foreground">-</span>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={awayGoals}
                  onChange={(e) => setAwayGoals(e.target.value)}
                  disabled={isLocked}
                  className="h-12 w-14 text-center text-lg font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="text-left">
            <p className="font-semibold text-sm md:text-base">{match.awayTeam}</p>
          </div>
        </div>

        {/* Points / Save */}
        <div className="mt-3 flex items-center justify-between">
          {prediction?.points != null && (
            <Badge variant={prediction.points >= 5 ? "success" : prediction.points > 0 ? "warning" : "secondary"}>
              {prediction.points} puntos
            </Badge>
          )}
          {!isLocked && (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={saving || homeGoals === "" || awayGoals === ""}
              className={cn(
                "ml-auto transition-all",
                saved && "bg-green-500 hover:bg-green-500"
              )}
            >
              {saving ? "Guardando..." : saved ? "¡Guardado!" : prediction ? "Actualizar" : "Guardar"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
