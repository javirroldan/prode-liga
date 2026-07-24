"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MatchdaySelectorProps {
  currentMatchday: number;
  totalMatchdays?: number;
  onChange: (matchday: number) => void;
}

export function MatchdaySelector({
  currentMatchday,
  totalMatchdays = 38,
  onChange,
}: MatchdaySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(1, currentMatchday - 1))}
        disabled={currentMatchday <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalMatchdays) }, (_, i) => {
          const start = Math.max(1, Math.min(currentMatchday - 2, totalMatchdays - 4));
          const day = start + i;
          return (
            <Button
              key={day}
              variant={day === currentMatchday ? "default" : "ghost"}
              size="sm"
              onClick={() => onChange(day)}
              className={cn(
                "w-10",
                day === currentMatchday && "bg-green-500 text-black hover:bg-green-400"
              )}
            >
              {day}
            </Button>
          );
        })}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(totalMatchdays, currentMatchday + 1))}
        disabled={currentMatchday >= totalMatchdays}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
