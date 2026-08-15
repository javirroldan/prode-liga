// Sync del fixture y resultados desde BeSoccer (Clausura Argentina 2026).
// Actualiza fecha/hora, goles y estado de partidos EXISTENTES sin borrar
// predicciones. Matchea por jornada + nombres de equipo normalizados.
//
// Uso: node --env-file=.env.local scripts/sync-from-besoccer.ts [roundStart] [roundEnd]
//   - Sin argumentos: sincroniza las 16 jornadas.
//   - Con argumentos: sincroniza el rango [roundStart, roundEnd].
//
// Políticas:
//   - Fechas 8-16 (placeholder: todos los partidos con la misma fecha/hora) NO se tocan.
//   - Partidos con manualResult=true (corregidos por admin) NO se sobreescriben.
//   - Cuando BeSoccer reporta Final (status=1), se cargan goles, se marca FINISHED
//     y se recalculan los puntos.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_BASE = 'http://apiclient.besoccerapps.com/scripts/api/api.php';
const LEAGUE_ID = 118;
const SEASON = '2026';

const teamNameOverrides = {
  'Atl. Tucumán': 'Atlético Tucumán',
  'CA Huracán': 'Huracán',
  'Central Córdoba': 'Central Cordoba',
  'Dep. Riestra': 'Deportivo Riestra',
  'Estudiantes La Plata': 'Estudiantes LP',
  'Estudiantes Río Cuarto': 'Estudiantes de Río Cuarto',
  'Gimnasia La Plata': 'Gimnasia y Esgrima LP',
  'Gimnasia Mendoza': 'Gimnasia y Esgrima Mendoza',
  'Indep. Rivadavia': 'Independiente Rivadavia',
  'Talleres Córdoba': 'Talleres',
  'Unión Santa Fe': 'Unión',
};

function normalizeTeamName(name) {
  return teamNameOverrides[name] ?? name;
}

function parseGoals(value) {
  if (value === null || value === undefined || value === 'x' || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function mapStatus(status) {
  switch (Number(status)) {
    case -1: return 'SCHEDULED';
    case 1: return 'FINISHED';
    default: return null;
  }
}

function isPlaceholderRound(matches) {
  if (matches.length === 0) return false;
  return new Set(matches.map((m) => m.schedule)).size === 1;
}

function calculatePoints(prediction, result) {
  const predHome = prediction.homeGoals;
  const predAway = prediction.awayGoals;
  const resHome = result.homeGoals;
  const resAway = result.awayGoals;

  if (predHome === resHome && predAway === resAway) return 12;

  let points = 0;
  const predResult = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';
  const resResult = resHome > resAway ? 'home' : resHome < resAway ? 'away' : 'draw';
  if (predResult === resResult) points = 5;
  if (predHome === resHome && predAway !== resAway) points += 2;
  if (predAway === resAway && predHome !== resHome) points += 2;
  return Math.min(points, 12);
}

async function updateParticipantPoints(tournamentId) {
  const participants = await prisma.participation.findMany({ where: { tournamentId } });
  for (const participant of participants) {
    const result = await prisma.prediction.aggregate({
      where: { userId: participant.userId, match: { tournamentId }, points: { not: null } },
      _sum: { points: true },
    });
    await prisma.participation.update({
      where: { id: participant.id },
      data: { totalPoints: result._sum.points || 0 },
    });
  }
}

async function fetchRound(round) {
  const url = new URL(API_BASE);
  url.searchParams.set('key', process.env.BESOCCER_API_KEY || '');
  url.searchParams.set('format', 'json');
  url.searchParams.set('req', 'matchs');
  url.searchParams.set('league', String(LEAGUE_ID));
  url.searchParams.set('round', String(round));
  url.searchParams.set('year', SEASON);
  url.searchParams.set('tz', 'America/Argentina/Buenos_Aires');

  const res = await fetch(url.toString());
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`BeSoccer error (round ${round}): ${text.slice(0, 100)}`);
  }
  return json?.match ?? [];
}

async function main() {
  const key = process.env.BESOCCER_API_KEY;
  if (!key) {
    console.error('Falta BESOCCER_API_KEY en .env.local');
    process.exit(1);
  }

  const tournament = await prisma.tournament.findFirst({ where: { isActive: true } });
  if (!tournament) {
    console.error('No hay torneo activo');
    process.exit(1);
  }

  const [startArg, endArg] = process.argv.slice(2);
  const roundStart = startArg ? parseInt(startArg) : 1;
  const roundEnd = endArg ? parseInt(endArg) : 16;

  let updated = 0;
  let finalized = 0;
  const missing = [];

  for (let round = roundStart; round <= roundEnd; round++) {
    const matches = await fetchRound(round);
    if (matches.length === 0) {
      console.log(`Fecha ${round}: sin datos (0 partidos), se omite`);
      continue;
    }

    const placeholder = isPlaceholderRound(matches);

    for (const m of matches) {
      const home = normalizeTeamName(m.local);
      const away = normalizeTeamName(m.visitor);

      const dbMatch = await prisma.match.findFirst({
        where: { tournamentId: tournament.id, matchday: round, homeTeam: home, awayTeam: away },
      });

      if (!dbMatch) {
        missing.push(`MD${round}: ${m.local} vs ${m.visitor}`);
        continue;
      }

      const data = {};
      let needsPoints = false;

      if (dbMatch.apiId !== Number(m.id)) {
        data.apiId = Number(m.id);
      }

      if (!placeholder) {
        // schedule de BeSoccer = hora local argentina (UTC-3) -> instante real UTC
        const datePart = m.schedule.slice(0, 10);
        const timePart = m.schedule.slice(11, 16);
        if (datePart && timePart) {
          const newDate = new Date(`${datePart}T${timePart}:00.000-03:00`);
          const newTime = timePart;
          const dbDate = new Date(dbMatch.date).toISOString().slice(0, 16);
          const newDateStr = newDate.toISOString().slice(0, 16);
          if (dbDate !== newDateStr || (dbMatch.time ?? '') !== newTime) {
            data.date = newDate;
            data.time = newTime;
          }
        }
      }

      if (!dbMatch.manualResult) {
        const bsStatus = mapStatus(m.status);
        if (bsStatus === 'FINISHED') {
          const homeGoals = parseGoals(m.local_goals);
          const awayGoals = parseGoals(m.visitor_goals);
          if (homeGoals !== null && awayGoals !== null) {
            const goalsChanged =
              dbMatch.homeGoals !== homeGoals ||
              dbMatch.awayGoals !== awayGoals ||
              dbMatch.status !== 'FINISHED';
            if (goalsChanged) {
              data.homeGoals = homeGoals;
              data.awayGoals = awayGoals;
              data.status = 'FINISHED';
              needsPoints = true;
            }
          }
        }
      }

      const keys = Object.keys(data);
      if (keys.length > 0) {
        await prisma.match.update({ where: { id: dbMatch.id }, data });
        updated++;
        if (needsPoints) finalized++;
      }
    }

    console.log(
      `Fecha ${round}: ${matches.length} partidos, ${placeholder ? 'placeholder (no se tocan fechas)' : 'horarios reales'}`
    );

    // Pequeña pausa para respetar cuota
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\nPartidos actualizados: ${updated}`);
  console.log(`Partidos finalizados/recuento de puntos: ${finalized}`);

  if (finalized > 0) {
    await updateParticipantPoints(tournament.id);
    console.log('Puntos de participantes recalculados');
  }

  if (missing.length > 0) {
    console.log('\nPartidos de BeSoccer no encontrados en la DB (revisar nombres):');
    missing.forEach((m) => console.log(`  ${m}`));
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
