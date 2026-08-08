const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TOURNAMENT_ID = 'c683c1f5-8847-407e-99f1-0a6ef90fe1e4';

// Fechas/horarios reales confirmados por AFA (02/08/2026) para las fechas 4 a 7.
// Los enfrentamientos no cambian, solo fecha y hora.
// Formato: [matchday, homeTeam, awayTeam, 'YYYY-MM-DD', 'HH:MM']
const schedule = [
  // FECHA 4
  // Viernes 7 agosto
  [4, 'Rosario Central', 'Aldosivi', '2026-08-07', '19:30'],
  [4, 'Independiente Rivadavia', 'Estudiantes de Río Cuarto', '2026-08-07', '21:45'],
  // Sábado 8 agosto
  [4, 'Deportivo Riestra', 'Estudiantes LP', '2026-08-08', '14:45'],
  [4, 'Atlético Tucumán', 'Sarmiento', '2026-08-08', '14:45'],
  [4, 'Tigre', 'River Plate', '2026-08-08', '17:00'],
  [4, 'Boca Juniors', 'Vélez Sarsfield', '2026-08-08', '19:15'],
  [4, 'Independiente', 'Platense', '2026-08-08', '21:30'],
  [4, 'Instituto', 'Gimnasia y Esgrima Mendoza', '2026-08-08', '21:30'],
  // Domingo 9 agosto
  [4, 'San Lorenzo', 'Huracán', '2026-08-09', '15:00'],
  [4, 'Defensa y Justicia', 'Newell\'s Old Boys', '2026-08-09', '17:45'],
  [4, 'Gimnasia y Esgrima LP', 'Barracas Central', '2026-08-09', '17:45'],
  [4, 'Argentinos Juniors', 'Racing Club', '2026-08-09', '20:15'],
  // Lunes 10 agosto
  [4, 'Banfield', 'Belgrano', '2026-08-10', '19:00'],
  [4, 'Unión', 'Central Cordoba', '2026-08-10', '21:15'],
  // Martes 11 agosto
  [4, 'Talleres', 'Lanús', '2026-08-11', '21:00'],

  // FECHA 5
  // Viernes 14 agosto
  [5, 'Racing Club', 'Banfield', '2026-08-14', '20:30'],
  // Sábado 15 agosto
  [5, 'Aldosivi', 'Tigre', '2026-08-15', '14:30'],
  [5, 'San Lorenzo', 'Unión', '2026-08-15', '14:30'],
  [5, 'Estudiantes LP', 'Gimnasia y Esgrima LP', '2026-08-15', '16:45'],
  [5, 'Newell\'s Old Boys', 'Deportivo Riestra', '2026-08-15', '19:00'],
  [5, 'Belgrano', 'Independiente Rivadavia', '2026-08-15', '19:00'],
  [5, 'Platense', 'Boca Juniors', '2026-08-15', '21:15'],
  // Domingo 16 agosto
  [5, 'Central Cordoba', 'Instituto', '2026-08-16', '15:00'],
  [5, 'Sarmiento', 'Huracán', '2026-08-16', '15:00'],
  [5, 'River Plate', 'Argentinos Juniors', '2026-08-16', '18:00'],
  [5, 'Barracas Central', 'Rosario Central', '2026-08-16', '20:15'],
  // Lunes 17 agosto
  [5, 'Estudiantes de Río Cuarto', 'Atlético Tucumán', '2026-08-17', '14:45'],
  [5, 'Lanús', 'Independiente', '2026-08-17', '17:00'],
  [5, 'Vélez Sarsfield', 'Defensa y Justicia', '2026-08-17', '19:15'],
  [5, 'Gimnasia y Esgrima Mendoza', 'Talleres', '2026-08-17', '21:30'],

  // FECHA 6 (Interzonal)
  // Viernes 21 agosto
  [6, 'Aldosivi', 'Unión', '2026-08-21', '14:30'],
  [6, 'Estudiantes de Río Cuarto', 'San Lorenzo', '2026-08-21', '20:00'],
  // Sábado 22 agosto
  [6, 'Gimnasia y Esgrima LP', 'Gimnasia y Esgrima Mendoza', '2026-08-22', '16:00'],
  [6, 'Atlético Tucumán', 'Instituto', '2026-08-22', '16:00'],
  [6, 'Independiente', 'Independiente Rivadavia', '2026-08-22', '18:30'],
  [6, 'Newell\'s Old Boys', 'Banfield', '2026-08-22', '21:00'],
  [6, 'Huracán', 'Deportivo Riestra', '2026-08-22', '21:00'],
  // Domingo 23 agosto
  [6, 'Sarmiento', 'Estudiantes LP', '2026-08-23', '14:45'],
  [6, 'Barracas Central', 'Platense', '2026-08-23', '14:45'],
  [6, 'Belgrano', 'Defensa y Justicia', '2026-08-23', '17:00'],
  [6, 'River Plate', 'Vélez Sarsfield', '2026-08-23', '19:15'],
  [6, 'Racing Club', 'Boca Juniors', '2026-08-23', '21:30'],
  // Lunes 24 agosto
  [6, 'Tigre', 'Central Cordoba', '2026-08-24', '19:00'],
  [6, 'Lanús', 'Argentinos Juniors', '2026-08-24', '21:15'],
  [6, 'Talleres', 'Rosario Central', '2026-08-24', '21:15'],

  // FECHA 7
  // Viernes 28 agosto
  [7, 'Huracán', 'Estudiantes de Río Cuarto', '2026-08-28', '19:00'],
  [7, 'Unión', 'Sarmiento', '2026-08-28', '21:15'],
  // Sábado 29 agosto
  [7, 'Deportivo Riestra', 'Vélez Sarsfield', '2026-08-29', '14:45'],
  [7, 'Rosario Central', 'Gimnasia y Esgrima LP', '2026-08-29', '17:00'],
  [7, 'Boca Juniors', 'Lanús', '2026-08-29', '19:00'],
  [7, 'Talleres', 'Central Cordoba', '2026-08-29', '21:30'],
  [7, 'Atlético Tucumán', 'Belgrano', '2026-08-29', '21:30'],
  // Domingo 30 agosto
  [7, 'Banfield', 'River Plate', '2026-08-30', '15:00'],
  [7, 'Argentinos Juniors', 'Aldosivi', '2026-08-30', '17:00'],
  [7, 'Independiente', 'Gimnasia y Esgrima Mendoza', '2026-08-30', '19:15'],
  [7, 'Independiente Rivadavia', 'Racing Club', '2026-08-30', '21:30'],
  // Lunes 31 agosto
  [7, 'Defensa y Justicia', 'Platense', '2026-08-31', '19:00'],
  [7, 'Estudiantes LP', 'Newell\'s Old Boys', '2026-08-31', '19:00'],
  [7, 'Tigre', 'Barracas Central', '2026-08-31', '21:15'],
  [7, 'Instituto', 'San Lorenzo', '2026-08-31', '21:15'],
];

async function main() {
  let updated = 0;
  let missing = [];

  for (const [matchday, homeTeam, awayTeam, date, time] of schedule) {
    const result = await prisma.match.updateMany({
      where: {
        tournamentId: TOURNAMENT_ID,
        matchday,
        homeTeam,
        awayTeam,
      },
      data: {
        date: new Date(date + 'T' + time + ':00.000Z'),
        time,
      },
    });

    if (result.count === 1) {
      updated++;
    } else {
      missing.push({ matchday, homeTeam, awayTeam, date, time });
    }
  }

  console.log(`Updated ${updated}/${schedule.length} matches`);

  if (missing.length > 0) {
    console.log('\nNo encontrados (revisar nombres):');
    missing.forEach((m) =>
      console.log(`  MD${m.matchday}: ${m.homeTeam} vs ${m.awayTeam} -> ${m.date} ${m.time}`)
    );
  }

  // Verificación
  for (let md = 4; md <= 7; md++) {
    const mds = await prisma.match.findMany({
      where: { matchday: md, tournamentId: TOURNAMENT_ID },
      orderBy: { date: 'asc' },
    });
    console.log(`\nFecha ${md} (${mds.length} partidos):`);
    mds.forEach((m) =>
      console.log(
        `  ${new Date(m.date).toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })} ${m.time} | ${m.homeTeam} vs ${m.awayTeam}`
      )
    );
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
