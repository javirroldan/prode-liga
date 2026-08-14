"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitPrediction } from "@/actions/predictions";
import { isMatchLocked } from "@/lib/match-utils";
import { getTeamLogo } from "@/lib/team-logos";
import { getTeamDisplayName } from "@/lib/team-display";
import { cn } from "@/lib/utils";
import { Lock, Minus, CalendarX } from "lucide-react";

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

function PointsBadge({
  points,
  isFinished,
}: {
  points: number | null | undefined;
  isFinished: boolean;
}) {
  if (!isFinished) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-white/40 shrink-0">
        -
      </div>
    );
  }

  const pts = points ?? 0;

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0",
        pts === 12 && "bg-yellow-500 text-white",
        pts === 7 && "bg-green-500 text-white",
        pts === 5 && "bg-blue-500 text-white",
        pts === 2 && "bg-orange-500 text-white",
        pts === 0 && "bg-white/10 text-white/40"
      )}
    >
      {pts > 0 ? `+${pts}` : pts}
    </div>
  );
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
  const [error, setError] = useState<string | null>(null);

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

  const gotPoints = isFinished && (prediction?.points ?? 0) > 0;
  const gotZero = isFinished && (prediction?.points ?? 0) === 0 && prediction;

  const homeLogo = match.homeLogo ?? getTeamLogo(match.homeTeam);
  const awayLogo = match.awayLogo ?? getTeamLogo(match.awayTeam);

  async function handleSubmit() {
    if (saving || isLocked) return;
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.append("matchId", match.id);
    formData.append("homeGoals", homeGoals);
    formData.append("awayGoals", awayGoals);

    const result = await submitPrediction(formData);
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <Card
      className={cn(
        "border-white/10 bg-black/40 backdrop-blur-sm transition-all duration-300",
        isLive && "border-red-500/50 shadow-lg shadow-red-500/10",
        match.status === "POSTPONED" && "border-orange-500/30",
        saved && "border-blue-400/50"
      )}
    >
      <CardContent className="p-3 flex flex-col gap-2">
        {/* Row 1: Badge + Teams + Score */}
        <div className="flex items-center gap-2">
          <PointsBadge points={prediction?.points} isFinished={isFinished} />

          <div className="flex-1 flex items-center gap-2 min-w-0">
            {/* Home team */}
            <div className="flex-1 flex flex-col items-end gap-1 min-w-0">
              {homeLogo && (
                <img
                  src={homeLogo}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-sm"
                />
              )}
              <span className="text-right text-xs font-semibold text-white/80 break-words">
                {getTeamDisplayName(match.homeTeam)}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              {isFinished && (
                <span className="inline-flex items-center gap-1 font-semibold text-blue-400 text-xs">
                  Finalizado
                </span>
              )}
              {isFinished || isLive ? (
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2 py-1",
                    gotPoints && "bg-green-500/20",
                    gotZero && "bg-red-500/20"
                  )}
                >
                  <span
                    className={cn(
                      "text-base font-bold min-w-[1.5ch] text-center",
                      gotPoints ? "text-green-400" : gotZero ? "text-red-400" : "text-white"
                    )}
                  >
                    {match.homeGoals ?? "-"}
                  </span>
                  <span className="text-xs font-bold text-white/30">-</span>
                  <span
                    className={cn(
                      "text-base font-bold min-w-[1.5ch] text-center",
                      gotPoints ? "text-green-400" : gotZero ? "text-red-400" : "text-white"
                    )}
                  >
                    {match.awayGoals ?? "-"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={homeGoals}
                    onChange={(e) => setHomeGoals(e.target.value)}
                    disabled={isLocked}
                    className="h-8 w-10 text-center text-base font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white/10 border-white/20 text-white placeholder:text-white/30"
                    placeholder="0"
                  />
                  <Minus className="h-3 w-3 text-white/30" />
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={awayGoals}
                    onChange={(e) => setAwayGoals(e.target.value)}
                    disabled={isLocked}
                    className="h-8 w-10 text-center text-base font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white/10 border-white/20 text-white placeholder:text-white/30"
                    placeholder="0"
                  />
                </div>
              )}
              {(isFinished || isLive) && prediction && (
                <span className="text-yellow-200/80 text-xs font-semibold">
                  ({prediction.homeGoals}-{prediction.awayGoals})
                </span>
              )}
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-start gap-1 min-w-0">
              {awayLogo && (
                <img
                  src={awayLogo}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-sm"
                />
              )}
              <span className="text-left text-xs font-semibold text-white/80 break-words">
                {getTeamDisplayName(match.awayTeam)}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Date + Status / Action */}
        <div className="flex items-center justify-between text-xs">
          {!isFinished && (
            <span className="text-yellow-200/80">
              {dateStr} {match.time || ""}
            </span>
          )}
          <div>
            {isLive && (
              <span className="inline-flex items-center gap-1 font-semibold text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                EN VIVO
              </span>
            )}
            {match.status === "POSTPONED" && (
              <span className="inline-flex items-center gap-1 font-semibold text-orange-400">
                <CalendarX className="h-3.5 w-3.5" />
                Postergado
              </span>
            )}
            {!isFinished && !isLive && match.status !== "POSTPONED" && isLocked && (
              <span className="inline-flex items-center gap-1 font-semibold text-yellow-400">
                <Lock className="h-3 w-3" />
                Bloqueado
              </span>
            )}
            {!isLocked && !isFinished && (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={saving || homeGoals === "" || awayGoals === ""}
                className={cn(
                  "h-7 px-3 text-xs",
                  saved && "bg-green-500 hover:bg-green-500"
                )}
              >
                {saving ? "Guardando..." : saved ? "Guardado" : prediction ? "Actualizar" : "Guardar"}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
