"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitPrediction } from "@/actions/predictions";
import { isMatchLocked } from "@/lib/match-utils";
import { cn } from "@/lib/utils";
import { CheckCircle2, Lock, Minus } from "lucide-react";

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
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs font-bold text-white/40">
        -
      </div>
    );
  }

  const pts = points ?? 0;

  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold",
        pts >= 12 && "bg-yellow-500 text-black",
        pts >= 5 && pts < 12 && "bg-blue-500 text-white",
        pts >= 2 && pts < 5 && "bg-green-500 text-white",
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
    <Card
      className={cn(
        "border-white/10 bg-black/40 backdrop-blur-sm transition-all duration-300",
        gotPoints && "border-green-500/40 bg-green-500/5",
        gotZero && "border-red-500/40 bg-red-500/5",
        isLive && "border-red-500/50 shadow-lg shadow-red-500/10",
        saved && "border-blue-400/50"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Points badge */}
          <PointsBadge points={prediction?.points} isFinished={isFinished} />

          {/* Home team */}
          <div className="flex-1 text-right">
            <span className="text-xs font-semibold text-white/80 truncate block">
              {match.homeTeam}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2">
            {isFinished || isLive ? (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5",
                  gotPoints && "bg-green-500/20",
                  gotZero && "bg-red-500/20"
                )}
              >
                <span
                  className={cn(
                    "text-lg font-bold min-w-[1.5ch] text-center",
                    gotPoints ? "text-green-400" : gotZero ? "text-red-400" : "text-white"
                  )}
                >
                  {match.homeGoals ?? "-"}
                </span>
                <span className="text-sm font-bold text-white/30">-</span>
                <span
                  className={cn(
                    "text-lg font-bold min-w-[1.5ch] text-center",
                    gotPoints ? "text-green-400" : gotZero ? "text-red-400" : "text-white"
                  )}
                >
                  {match.awayGoals ?? "-"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
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
          </div>

          {/* Away team */}
          <div className="flex-1 text-left">
            <span className="text-xs font-semibold text-white/80 truncate block">
              {match.awayTeam}
            </span>
          </div>

          {/* Status / Action */}
          <div className="w-24 flex justify-end">
            {isFinished && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Finalizado
              </span>
            )}
            {isLive && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                EN VIVO
              </span>
            )}
            {!isFinished && !isLive && isLocked && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-400">
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
                  "h-7 px-2 text-xs",
                  saved && "bg-green-500 hover:bg-green-500"
                )}
              >
                {saving ? "..." : saved ? "OK" : prediction ? "Update" : "Save"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
