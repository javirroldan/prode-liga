"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { isMatchLocked } from "@/lib/match-utils";

export async function submitPrediction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Debés iniciar sesión" };
  }

  const matchId = formData.get("matchId") as string;
  const homeGoals = parseInt(formData.get("homeGoals") as string);
  const awayGoals = parseInt(formData.get("awayGoals") as string);

  if (isNaN(homeGoals) || isNaN(awayGoals)) {
    return { error: "Ingresá los goles de ambos equipos" };
  }

  if (homeGoals < 0 || awayGoals < 0) {
    return { error: "Los goles no pueden ser negativos" };
  }

  // Check if match exists and is not started
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    return { error: "Partido no encontrado" };
  }

  if (match.status !== "SCHEDULED") {
    return { error: "No se pueden cargar pronósticos para partidos ya iniciados" };
  }

  if (isMatchLocked(match.date, match.time)) {
    return { error: "El pronóstico se bloquea 30 minutos antes del inicio del partido" };
  }

  // Upsert prediction
  const existingPrediction = await prisma.prediction.findUnique({
    where: {
      userId_matchId: {
        userId: user.id,
        matchId,
      },
    },
  });

  if (existingPrediction) {
    await prisma.prediction.update({
      where: { id: existingPrediction.id },
      data: { homeGoals, awayGoals },
    });
  } else {
    await prisma.prediction.create({
      data: {
        userId: user.id,
        matchId,
        homeGoals,
        awayGoals,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/fixture");
  return { success: true };
}

export async function getUserPredictions(matchday?: number) {
  const user = await getCurrentUser();
  if (!user) return [];

  const where: any = {
    userId: user.id,
  };

  if (matchday) {
    where.match = { matchday };
  }

  return prisma.prediction.findMany({
    where,
    include: { match: true },
  });
}

export async function getMatchdayPredictions(matchday: number, tournamentId?: string) {
  const user = await getCurrentUser();
  if (!user) return [];

  const where: any = { matchday };
  if (tournamentId) {
    where.tournamentId = tournamentId;
  }

  const matches = await prisma.match.findMany({
    where,
    orderBy: { date: "asc" },
  });

  const predictions = await prisma.prediction.findMany({
    where: {
      userId: user.id,
      matchId: { in: matches.map((m) => m.id) },
    },
  });

  return matches.map((match) => ({
    ...match,
    prediction: predictions.find((p) => p.matchId === match.id) || null,
  }));
}
