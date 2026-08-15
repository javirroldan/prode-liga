const API_BASE = "http://apiclient.besoccerapps.com/scripts/api/api.php";
const CLAUSURA_LEAGUE_ID = 118;
const SEASON = "2026";

// Normalización de nombres BeSoccer -> nombres canónicos de la DB
const teamNameOverrides: Record<string, string> = {
  "Atl. Tucumán": "Atlético Tucumán",
  "CA Huracán": "Huracán",
  "Central Córdoba": "Central Cordoba",
  "Dep. Riestra": "Deportivo Riestra",
  "Estudiantes La Plata": "Estudiantes LP",
  "Estudiantes Río Cuarto": "Estudiantes de Río Cuarto",
  "Gimnasia La Plata": "Gimnasia y Esgrima LP",
  "Gimnasia Mendoza": "Gimnasia y Esgrima Mendoza",
  "Indep. Rivadavia": "Independiente Rivadavia",
  "Talleres Córdoba": "Talleres",
  "Unión Santa Fe": "Unión",
};

export function normalizeTeamName(name: string): string {
  return teamNameOverrides[name] ?? name;
}

export interface BeSoccerMatch {
  id: string;
  local: string;
  visitor: string;
  local_abbr?: string;
  visitor_abbr?: string;
  date: string;
  hour: string;
  minute: string;
  schedule: string;
  no_hour?: boolean;
  local_goals: string | number | null;
  visitor_goals: string | number | null;
  status: string | number;
  result?: string;
}

export async function fetchMatchday(round: number | string): Promise<BeSoccerMatch[]> {
  const url = new URL(API_BASE);
  url.searchParams.set("key", process.env.BESOCCER_API_KEY || "");
  url.searchParams.set("format", "json");
  url.searchParams.set("req", "matchs");
  url.searchParams.set("league", String(CLAUSURA_LEAGUE_ID));
  url.searchParams.set("round", String(round));
  url.searchParams.set("year", SEASON);
  url.searchParams.set("tz", "America/Argentina/Buenos_Aires");

  const res = await fetch(url.toString());
  const text = await res.text();
  let json: { match?: BeSoccerMatch[] } | null;
  try {
    json = JSON.parse(text) as { match?: BeSoccerMatch[] };
  } catch {
    throw new Error(`BeSoccer error: ${text}`);
  }
  return json?.match ?? [];
}

export function parseGoals(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "x" || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

// Argentina usa UTC-3 todo el año (sin horario de verano desde 2009).
const ARGENTINA_UTC_OFFSET = "-03:00";

// Convierte el `schedule` de BeSoccer (hora local argentina) al instante real UTC.
// Ej: "2026-08-14 20:30:00" (20:30 AR = UTC-3) -> 2026-08-14T23:30:00.000Z
export function scheduleToUtc(schedule: string): Date {
  const datePart = schedule.slice(0, 10);
  const timePart = schedule.slice(11, 16);
  return new Date(`${datePart}T${timePart}:00.000${ARGENTINA_UTC_OFFSET}`);
}

export function isPlaceholderRound(matches: BeSoccerMatch[]): boolean {
  if (matches.length === 0) return false;
  const schedules = new Set(matches.map((m) => m.schedule));
  return schedules.size === 1;
}

// BeSoccer: -1 = sin comenzar, 1 = final. Código LIVE aún sin confirmar.
// Devuelve null para estados desconocidos (se conserva el estado actual de la DB).
export function mapStatus(
  status: string | number
): "SCHEDULED" | "FINISHED" | null {
  switch (Number(status)) {
    case -1:
      return "SCHEDULED";
    case 1:
      return "FINISHED";
    default:
      return null;
  }
}
