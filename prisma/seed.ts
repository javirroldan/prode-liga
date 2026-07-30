import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default tournament
  const tournament = await prisma.tournament.upsert({
    where: { inviteCode: "LIGA2026" },
    update: {},
    create: {
      name: "Liga Profesional Argentina 2026",
      season: "2026",
      inviteCode: "LIGA2026",
      isActive: true,
    },
  });

  console.log("Tournament created:", tournament.name);

  // Sample matches for matchday 1
  const matches = [
    { homeTeam: "River Plate", awayTeam: "Barracas Central", matchday: 1, date: new Date("2026-02-15T19:00:00Z") },
    { homeTeam: "Boca Juniors", awayTeam: "Independiente", matchday: 1, date: new Date("2026-02-15T21:30:00Z") },
    { homeTeam: "Racing Club", awayTeam: "San Lorenzo", matchday: 1, date: new Date("2026-02-16T16:00:00Z") },
    { homeTeam: "Huracán", awayTeam: "Estudiantes", matchday: 1, date: new Date("2026-02-16T18:30:00Z") },
    { homeTeam: "Vélez Sarsfield", awayTeam: "Gimnasia y Esgrima LP", matchday: 1, date: new Date("2026-02-16T21:00:00Z") },
    { homeTeam: "Defensa y Justicia", awayTeam: "Lanús", matchday: 1, date: new Date("2026-02-17T19:00:00Z") },
    { homeTeam: "Talleres de Córdoba", awayTeam: "Belgrano", matchday: 1, date: new Date("2026-02-17T21:30:00Z") },
    { homeTeam: "Argentinos Juniors", awayTeam: "Unión Santa Fe", matchday: 1, date: new Date("2026-02-18T19:00:00Z") },
    { homeTeam: "Tigre", awayTeam: "Platense", matchday: 1, date: new Date("2026-02-18T21:00:00Z") },
    { homeTeam: "Atlético Tucumán", awayTeam: "Sarmiento de Junín", matchday: 1, date: new Date("2026-02-18T23:00:00Z") },
    { homeTeam: "Central Cordoba", awayTeam: "Banfield", matchday: 1, date: new Date("2026-02-19T19:00:00Z") },
    { homeTeam: "Godoy Cruz", awayTeam: "Barracas Central", matchday: 1, date: new Date("2026-02-19T21:30:00Z") },
    { homeTeam: "Newell's Old Boys", awayTeam: "Rosario Central", matchday: 1, date: new Date("2026-02-19T21:00:00Z") },
    { homeTeam: "Estudiantes de Río Cuarto", awayTeam: "Aldosivi", matchday: 1, date: new Date("2026-02-19T19:00:00Z") },
  ];

  for (const match of matches) {
    await prisma.match.create({
      data: {
        ...match,
        tournamentId: tournament.id,
        status: "SCHEDULED",
      },
    });
  }

  console.log(`Created ${matches.length} sample matches`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
