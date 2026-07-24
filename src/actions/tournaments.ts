"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

export async function joinTournament(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Debés iniciar sesión" };
  }

  const inviteCode = formData.get("inviteCode") as string;

  if (!inviteCode) {
    return { error: "Ingresá un código de invitación" };
  }

  const tournament = await prisma.tournament.findUnique({
    where: { inviteCode },
  });

  if (!tournament) {
    return { error: "Código de invitación inválido" };
  }

  const existingParticipation = await prisma.participation.findUnique({
    where: {
      userId_tournamentId: {
        userId: user.id,
        tournamentId: tournament.id,
      },
    },
  });

  if (existingParticipation) {
    return { error: "Ya estás participando en este torneo" };
  }

  await prisma.participation.create({
    data: {
      userId: user.id,
      tournamentId: tournament.id,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, tournamentName: tournament.name };
}

export async function getTournamentRanking(tournamentId: string) {
  return prisma.participation.findMany({
    where: { tournamentId },
    include: {
      user: {
        select: {
          name: true,
          nickname: true,
          avatar: true,
        },
      },
    },
    orderBy: { totalPoints: "desc" },
  });
}

export async function getUserTournaments() {
  const user = await getCurrentUser();
  if (!user) return [];

  return prisma.participation.findMany({
    where: { userId: user.id },
    include: {
      tournament: true,
    },
  });
}
