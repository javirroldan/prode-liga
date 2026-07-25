const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TOURNAMENT_ID = 'c683c1f5-8847-407e-99f1-0a6ef90fe1e4';

// Clausura 2026 fixture from official Liga Profesional source
// Format: [home, away]
const fixture = {
  1: {
    interzonal: ['Defensa y Justicia', 'Aldosivi'],
    zonaA: [
      ['Deportivo Riestra', 'Boca Juniors'],
      ['Estudiantes LP', 'Independiente'],
      ['Newell\'s Old Boys', 'Talleres'],
      ['Vélez Sarsfield', 'Instituto'],
      ['Platense', 'Unión'],
      ['Lanús', 'San Lorenzo'],
      ['Gimnasia y Esgrima Mendoza', 'Central Córdoba de Santiago'],
    ],
    zonaB: [
      ['River Plate', 'Barracas Central'],
      ['Racing Club', 'Gimnasia y Esgrima LP'],
      ['Belgrano', 'Rosario Central'],
      ['Estudiantes de Río Cuarto', 'Tigre'],
      ['Sarmiento', 'Argentinos Juniors'],
      ['Huracán', 'Banfield'],
      ['Atlético Tucumán', 'Independiente Rivadavia'],
    ],
  },
  2: {
    interzonal: ['Central Córdoba de Santiago', 'Atlético Tucumán'],
    zonaA: [
      ['San Lorenzo', 'Gimnasia y Esgrima Mendoza'],
      ['Unión', 'Lanús'],
      ['Instituto', 'Platense'],
      ['Talleres', 'Vélez Sarsfield'],
      ['Independiente', 'Newell\'s Old Boys'],
      ['Boca Juniors', 'Estudiantes LP'],
      ['Defensa y Justicia', 'Deportivo Riestra'],
    ],
    zonaB: [
      ['Independiente Rivadavia', 'Huracán'],
      ['Banfield', 'Sarmiento'],
      ['Argentinos Juniors', 'Estudiantes de Río Cuarto'],
      ['Tigre', 'Belgrano'],
      ['Rosario Central', 'Racing Club'],
      ['Gimnasia y Esgrima LP', 'River Plate'],
      ['Barracas Central', 'Aldosivi'],
    ],
  },
  3: {
    interzonal: ['Deportivo Riestra', 'Barracas Central'],
    zonaA: [
      ['Estudiantes LP', 'Defensa y Justicia'],
      ['Newell\'s Old Boys', 'Boca Juniors'],
      ['Vélez Sarsfield', 'Independiente'],
      ['Platense', 'Talleres'],
      ['Lanús', 'Instituto'],
      ['Gimnasia y Esgrima Mendoza', 'Unión'],
      ['Central Córdoba de Santiago', 'San Lorenzo'],
    ],
    zonaB: [
      ['Aldosivi', 'Gimnasia y Esgrima LP'],
      ['River Plate', 'Rosario Central'],
      ['Racing Club', 'Tigre'],
      ['Belgrano', 'Argentinos Juniors'],
      ['Estudiantes de Río Cuarto', 'Banfield'],
      ['Sarmiento', 'Independiente Rivadavia'],
      ['Huracán', 'Atlético Tucumán'],
    ],
  },
  4: {
    interzonal: ['San Lorenzo', 'Huracán'],
    zonaA: [
      ['Unión', 'Central Córdoba de Santiago'],
      ['Instituto', 'Gimnasia y Esgrima Mendoza'],
      ['Talleres', 'Lanús'],
      ['Independiente', 'Platense'],
      ['Boca Juniors', 'Vélez Sarsfield'],
      ['Defensa y Justicia', 'Newell\'s Old Boys'],
      ['Deportivo Riestra', 'Estudiantes LP'],
    ],
    zonaB: [
      ['Atlético Tucumán', 'Sarmiento'],
      ['Independiente Rivadavia', 'Estudiantes de Río Cuarto'],
      ['Banfield', 'Belgrano'],
      ['Argentinos Juniors', 'Racing Club'],
      ['Tigre', 'River Plate'],
      ['Rosario Central', 'Aldosivi'],
      ['Gimnasia y Esgrima LP', 'Barracas Central'],
    ],
  },
  5: {
    interzonal: ['Estudiantes LP', 'Gimnasia y Esgrima LP'],
    zonaA: [
      ['Newell\'s Old Boys', 'Deportivo Riestra'],
      ['Vélez Sarsfield', 'Defensa y Justicia'],
      ['Platense', 'Boca Juniors'],
      ['Lanús', 'Independiente'],
      ['Gimnasia y Esgrima Mendoza', 'Talleres'],
      ['Central Córdoba de Santiago', 'Instituto'],
      ['San Lorenzo', 'Unión'],
    ],
    zonaB: [
      ['Barracas Central', 'Rosario Central'],
      ['Aldosivi', 'Tigre'],
      ['River Plate', 'Argentinos Juniors'],
      ['Racing Club', 'Banfield'],
      ['Belgrano', 'Independiente Rivadavia'],
      ['Estudiantes de Río Cuarto', 'Atlético Tucumán'],
      ['Sarmiento', 'Huracán'],
    ],
  },
  6: {
    interzonal: ['Todos vs Todos'], // Date 6 is special interzonal
    zonaA: [
      ['River Plate', 'Vélez Sarsfield'],
      ['Barracas Central', 'Platense'],
      ['Talleres', 'Rosario Central'],
      ['Sarmiento', 'Estudiantes LP'],
      ['Belgrano', 'Defensa y Justicia'],
      ['Lanús', 'Argentinos Juniors'],
      ['Racing Club', 'Boca Juniors'],
    ],
    zonaB: [
      ['Independiente', 'Independiente Rivadavia'],
      ['Aldosivi', 'Unión'],
      ['Atlético Tucumán', 'Instituto'],
      ['Estudiantes de Río Cuarto', 'San Lorenzo'],
      ['Gimnasia y Esgrima LP', 'Gimnasia y Esgrima Mendoza'],
      ['Tigre', 'Central Córdoba de Santiago'],
      ['Huracán', 'Deportivo Riestra'],
    ],
    extra: ['Newell\'s Old Boys', 'Banfield'],
  },
  7: {
    interzonal: ['Unión', 'Sarmiento'],
    zonaA: [
      ['Instituto', 'San Lorenzo'],
      ['Talleres', 'Central Córdoba de Santiago'],
      ['Independiente', 'Gimnasia y Esgrima Mendoza'],
      ['Boca Juniors', 'Lanús'],
      ['Defensa y Justicia', 'Platense'],
      ['Deportivo Riestra', 'Vélez Sarsfield'],
      ['Estudiantes LP', 'Newell\'s Old Boys'],
    ],
    zonaB: [
      ['Huracán', 'Estudiantes de Río Cuarto'],
      ['Atlético Tucumán', 'Belgrano'],
      ['Independiente Rivadavia', 'Racing Club'],
      ['Banfield', 'River Plate'],
      ['Argentinos Juniors', 'Aldosivi'],
      ['Tigre', 'Barracas Central'],
      ['Rosario Central', 'Gimnasia y Esgrima LP'],
    ],
  },
  8: {
    interzonal: ['Rosario Central', 'Newell\'s Old Boys'],
    zonaA: [
      ['Vélez Sarsfield', 'Estudiantes LP'],
      ['Platense', 'Deportivo Riestra'],
      ['Lanús', 'Defensa y Justicia'],
      ['Gimnasia y Esgrima Mendoza', 'Boca Juniors'],
      ['Central Córdoba de Santiago', 'Independiente'],
      ['San Lorenzo', 'Talleres'],
      ['Unión', 'Instituto'],
    ],
    zonaB: [
      ['Gimnasia y Esgrima LP', 'Tigre'],
      ['Barracas Central', 'Argentinos Juniors'],
      ['Aldosivi', 'Banfield'],
      ['River Plate', 'Independiente Rivadavia'],
      ['Racing Club', 'Atlético Tucumán'],
      ['Belgrano', 'Huracán'],
      ['Estudiantes de Río Cuarto', 'Sarmiento'],
    ],
  },
  9: {
    interzonal: ['Instituto', 'Estudiantes de Río Cuarto'],
    zonaA: [
      ['Talleres', 'Unión'],
      ['Independiente', 'San Lorenzo'],
      ['Boca Juniors', 'Central Córdoba de Santiago'],
      ['Defensa y Justicia', 'Gimnasia y Esgrima Mendoza'],
      ['Deportivo Riestra', 'Lanús'],
      ['Estudiantes LP', 'Platense'],
      ['Newell\'s Old Boys', 'Vélez Sarsfield'],
    ],
    zonaB: [
      ['Sarmiento', 'Belgrano'],
      ['Huracán', 'Racing Club'],
      ['Atlético Tucumán', 'River Plate'],
      ['Independiente Rivadavia', 'Aldosivi'],
      ['Banfield', 'Barracas Central'],
      ['Argentinos Juniors', 'Gimnasia y Esgrima LP'],
      ['Tigre', 'Rosario Central'],
    ],
  },
  10: {
    interzonal: ['Vélez Sarsfield', 'Tigre'],
    zonaA: [
      ['Platense', 'Newell\'s Old Boys'],
      ['Lanús', 'Estudiantes LP'],
      ['Gimnasia y Esgrima Mendoza', 'Deportivo Riestra'],
      ['Central Córdoba de Santiago', 'Defensa y Justicia'],
      ['San Lorenzo', 'Boca Juniors'],
      ['Unión', 'Independiente'],
      ['Instituto', 'Talleres'],
    ],
    zonaB: [
      ['Rosario Central', 'Argentinos Juniors'],
      ['Gimnasia y Esgrima LP', 'Banfield'],
      ['Barracas Central', 'Independiente Rivadavia'],
      ['Aldosivi', 'Atlético Tucumán'],
      ['River Plate', 'Huracán'],
      ['Racing Club', 'Sarmiento'],
      ['Belgrano', 'Estudiantes de Río Cuarto'],
    ],
  },
  11: {
    interzonal: ['Talleres', 'Belgrano'],
    zonaA: [
      ['Independiente', 'Instituto'],
      ['Boca Juniors', 'Unión'],
      ['Defensa y Justicia', 'San Lorenzo'],
      ['Deportivo Riestra', 'Central Córdoba de Santiago'],
      ['Estudiantes LP', 'Gimnasia y Esgrima Mendoza'],
      ['Newell\'s Old Boys', 'Lanús'],
      ['Vélez Sarsfield', 'Platense'],
    ],
    zonaB: [
      ['Estudiantes de Río Cuarto', 'Racing Club'],
      ['Sarmiento', 'River Plate'],
      ['Huracán', 'Aldosivi'],
      ['Atlético Tucumán', 'Barracas Central'],
      ['Independiente Rivadavia', 'Gimnasia y Esgrima LP'],
      ['Banfield', 'Rosario Central'],
      ['Argentinos Juniors', 'Tigre'],
    ],
  },
  12: {
    interzonal: ['Platense', 'Argentinos Juniors'],
    zonaA: [
      ['Lanús', 'Vélez Sarsfield'],
      ['Gimnasia y Esgrima Mendoza', 'Newell\'s Old Boys'],
      ['Central Córdoba de Santiago', 'Estudiantes LP'],
      ['San Lorenzo', 'Deportivo Riestra'],
      ['Unión', 'Defensa y Justicia'],
      ['Instituto', 'Boca Juniors'],
      ['Talleres', 'Independiente'],
    ],
    zonaB: [
      ['Tigre', 'Banfield'],
      ['Rosario Central', 'Independiente Rivadavia'],
      ['Gimnasia y Esgrima LP', 'Atlético Tucumán'],
      ['Barracas Central', 'Huracán'],
      ['Aldosivi', 'Sarmiento'],
      ['River Plate', 'Estudiantes de Río Cuarto'],
      ['Racing Club', 'Belgrano'],
    ],
  },
  13: {
    interzonal: ['Racing Club', 'Independiente'],
    zonaA: [
      ['Boca Juniors', 'Talleres'],
      ['Defensa y Justicia', 'Instituto'],
      ['Deportivo Riestra', 'Unión'],
      ['Estudiantes LP', 'San Lorenzo'],
      ['Newell\'s Old Boys', 'Central Córdoba de Santiago'],
      ['Vélez Sarsfield', 'Gimnasia y Esgrima Mendoza'],
      ['Platense', 'Lanús'],
    ],
    zonaB: [
      ['Belgrano', 'River Plate'],
      ['Estudiantes de Río Cuarto', 'Aldosivi'],
      ['Sarmiento', 'Barracas Central'],
      ['Huracán', 'Gimnasia y Esgrima LP'],
      ['Atlético Tucumán', 'Rosario Central'],
      ['Independiente Rivadavia', 'Tigre'],
      ['Banfield', 'Argentinos Juniors'],
    ],
  },
  14: {
    interzonal: ['Banfield', 'Lanús'],
    zonaA: [
      ['Gimnasia y Esgrima Mendoza', 'Platense'],
      ['Central Córdoba de Santiago', 'Vélez Sarsfield'],
      ['San Lorenzo', 'Newell\'s Old Boys'],
      ['Unión', 'Estudiantes LP'],
      ['Instituto', 'Deportivo Riestra'],
      ['Talleres', 'Defensa y Justicia'],
      ['Independiente', 'Boca Juniors'],
    ],
    zonaB: [
      ['Argentinos Juniors', 'Independiente Rivadavia'],
      ['Tigre', 'Atlético Tucumán'],
      ['Rosario Central', 'Huracán'],
      ['Gimnasia y Esgrima LP', 'Sarmiento'],
      ['Barracas Central', 'Estudiantes de Río Cuarto'],
      ['Aldosivi', 'Belgrano'],
      ['River Plate', 'Racing Club'],
    ],
  },
  15: {
    interzonal: ['Boca Juniors', 'River Plate'],
    zonaA: [
      ['Defensa y Justicia', 'Independiente'],
      ['Deportivo Riestra', 'Talleres'],
      ['Estudiantes LP', 'Instituto'],
      ['Newell\'s Old Boys', 'Unión'],
      ['Vélez Sarsfield', 'San Lorenzo'],
      ['Platense', 'Central Córdoba de Santiago'],
      ['Lanús', 'Gimnasia y Esgrima Mendoza'],
    ],
    zonaB: [
      ['Racing Club', 'Aldosivi'],
      ['Belgrano', 'Barracas Central'],
      ['Estudiantes de Río Cuarto', 'Gimnasia y Esgrima LP'],
      ['Sarmiento', 'Rosario Central'],
      ['Huracán', 'Tigre'],
      ['Atlético Tucumán', 'Argentinos Juniors'],
      ['Independiente Rivadavia', 'Banfield'],
    ],
  },
  16: {
    interzonal: ['Gimnasia y Esgrima Mendoza', 'Independiente Rivadavia'],
    zonaA: [
      ['Central Córdoba de Santiago', 'Lanús'],
      ['San Lorenzo', 'Platense'],
      ['Unión', 'Vélez Sarsfield'],
      ['Instituto', 'Newell\'s Old Boys'],
      ['Talleres', 'Estudiantes LP'],
      ['Independiente', 'Deportivo Riestra'],
      ['Boca Juniors', 'Defensa y Justicia'],
    ],
    zonaB: [
      ['Banfield', 'Atlético Tucumán'],
      ['Argentinos Juniors', 'Huracán'],
      ['Tigre', 'Sarmiento'],
      ['Rosario Central', 'Estudiantes de Río Cuarto'],
      ['Gimnasia y Esgrima LP', 'Belgrano'],
      ['Barracas Central', 'Racing Club'],
      ['Aldosivi', 'River Plate'],
    ],
  },
};

// Starting date: Saturday July 25, 2026
const startDate = new Date('2026-07-25T18:00:00.000Z');

// Time slots for matches within a matchday
const timeSlots = [
  '14:00', '16:15', '16:15', '18:30', '18:30', '20:45', '20:45',
  '14:00', '16:15', '16:15', '18:30', '18:30', '20:45', '20:45',
  '21:00',
];

async function main() {
  const matches = [];

  for (const [matchdayStr, data] of Object.entries(fixture)) {
    const matchday = parseInt(matchdayStr);
    const dayOffset = (matchday - 1) * 7;
    const matchDate = new Date(startDate);
    matchDate.setDate(matchDate.getDate() + dayOffset);

    let matchIndex = 0;

    // Interzonal
    if (data.interzonal[0] !== 'Todos vs Todos') {
      matches.push({
        tournamentId: TOURNAMENT_ID,
        matchday,
        homeTeam: data.interzonal[0],
        awayTeam: data.interzonal[1],
        date: matchDate,
        time: timeSlots[matchIndex] || '18:30',
        status: 'SCHEDULED',
      });
      matchIndex++;
    }

    // Zona A
    for (const [home, away] of data.zonaA) {
      matches.push({
        tournamentId: TOURNAMENT_ID,
        matchday,
        homeTeam: home,
        awayTeam: away,
        date: matchDate,
        time: timeSlots[matchIndex] || '18:30',
        status: 'SCHEDULED',
      });
      matchIndex++;
    }

    // Zona B
    for (const [home, away] of data.zonaB) {
      matches.push({
        tournamentId: TOURNAMENT_ID,
        matchday,
        homeTeam: home,
        awayTeam: away,
        date: matchDate,
        time: timeSlots[matchIndex] || '18:30',
        status: 'SCHEDULED',
      });
      matchIndex++;
    }

    // Extra match (Date 6 has Newell's vs Banfield)
    if (data.extra) {
      matches.push({
        tournamentId: TOURNAMENT_ID,
        matchday,
        homeTeam: data.extra[0],
        awayTeam: data.extra[1],
        date: matchDate,
        time: timeSlots[matchIndex] || '18:30',
        status: 'SCHEDULED',
      });
    }
  }

  console.log(`Inserting ${matches.length} matches...`);

  // Insert in batches
  const batchSize = 50;
  for (let i = 0; i < matches.length; i += batchSize) {
    const batch = matches.slice(i, i + batchSize);
    await prisma.match.createMany({ data: batch });
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} matches`);
  }

  // Verify
  const count = await prisma.match.count();
  console.log(`Total matches in DB: ${count}`);

  // Show first matchday summary
  const m1 = await prisma.match.findMany({
    where: { matchday: 1 },
    orderBy: { homeTeam: 'asc' },
  });
  console.log(`\nFecha 1 (${m1.length} partidos):`);
  m1.forEach(m => console.log(`  ${m.homeTeam} vs ${m.awayTeam}`));

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
