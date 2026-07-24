"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { syncFixtures, syncLiveScores, calculateAndStorePoints } from "@/services/sync";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    throw new Error("Acceso denegado: se requieren permisos de administrador");
  }
  return user;
}

export async function createTournament(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const season = formData.get("season") as string;

  if (!name || !season) {
    return { error: "Nombre y temporada son obligatorios" };
  }

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  await prisma.tournament.create({
    data: {
      name,
      season,
      inviteCode,
    },
  });

  revalidatePath("/admin");
  return { success: true, inviteCode };
}

export async function syncMatchday(matchday: number) {
  await requireAdmin();

  const result = await syncFixtures(matchday);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/fixture");
  return result;
}

export async function syncLive() {
  await requireAdmin();

  const result = await syncLiveScores();
  revalidatePath("/dashboard");
  return result;
}

export async function recalculatePoints() {
  await requireAdmin();

  const result = await calculateAndStorePoints();
  revalidatePath("/admin");
  revalidatePath("/ranking");
  return result;
}

export async function getUsersWithoutPrediction(matchday: number) {
  await requireAdmin();

  const tournament = await prisma.tournament.findFirst({
    where: { isActive: true },
  });

  if (!tournament) return [];

  const matches = await prisma.match.findMany({
    where: { matchday, tournamentId: tournament.id },
  });

  const matchIds = matches.map((m) => m.id);

  const usersWithPrediction = await prisma.prediction.findMany({
    where: {
      matchId: { in: matchIds },
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  const userIdsWithPrediction = usersWithPrediction.map((p) => p.userId);

  const allParticipants = await prisma.participation.findMany({
    where: { tournamentId: tournament.id },
    include: {
      user: {
        select: {
          name: true,
          nickname: true,
        },
      },
    },
  });

  return allParticipants
    .filter((p) => !userIdsWithPrediction.includes(p.userId))
    .map((p) => p.user);
}
