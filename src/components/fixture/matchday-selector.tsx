"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MatchdaySelectorProps {
  currentMatchday: number;
  totalMatchdays?: number;
  baseUrl?: string;
}

export function MatchdaySelector({
  currentMatchday,
  totalMatchdays = 38,
  baseUrl = "/fixture",
}: MatchdaySelectorProps) {
  const start = Math.max(1, Math.min(currentMatchday - 2, totalMatchdays - 4));
  const days = Array.from({ length: Math.min(5, totalMatchdays) }, (_, i) => start + i);

  return (
    <div className="flex items-center gap-2">
      <Link href={`${baseUrl}?matchday=${Math.max(1, currentMatchday - 1)}`}>
        <Button
          variant="outline"
          size="icon"
          disabled={currentMatchday <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div className="flex items-center gap-1">
        {days.map((day) => (
          <Link key={day} href={`${baseUrl}?matchday=${day}`}>
            <Button
              variant={day === currentMatchday ? "default" : "ghost"}
              size="sm"
              className={cn(
                "w-10",
                day === currentMatchday && "bg-green-500 text-black hover:bg-green-400"
              )}
            >
              {day}
            </Button>
          </Link>
        ))}
      </div>
      <Link href={`${baseUrl}?matchday=${Math.min(totalMatchdays, currentMatchday + 1)}`}>
        <Button
          variant="outline"
          size="icon"
          disabled={currentMatchday >= totalMatchdays}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
