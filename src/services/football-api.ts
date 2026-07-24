const API_BASE = "https://v3.football.api-sports.io";
const LEAGUE_ID = 128; // Liga Profesional Argentina
const SEASON = 2026;

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
    status: {
      short: string;
      long: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface ApiResponse {
  response: ApiFixture[];
  paging: {
    current: number;
    total: number;
  };
}

async function apiFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const res = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-host": "v3.football.api-sports.io",
      "x-rapidapi-key": process.env.FOOTBALL_API_KEY || "",
    },
    next: { revalidate: 300 }, // Cache 5 minutes
  });

  if (!res.ok) {
    throw new Error(`API-Football error: ${res.status}`);
  }

  return res.json();
}

export async function getFixturesByRound(round: number): Promise<ApiFixture[]> {
  const data = await apiFetch<ApiResponse>("/fixtures", {
    league: LEAGUE_ID.toString(),
    season: SEASON.toString(),
    round: `Regular Season - ${round}`,
  });
  return data.response;
}

export async function getLiveFixtures(): Promise<ApiFixture[]> {
  const data = await apiFetch<ApiResponse>("/fixtures", {
    league: LEAGUE_ID.toString(),
    season: SEASON.toString(),
    live: "all",
  });
  return data.response;
}

export async function getFixtureById(fixtureId: number): Promise<ApiFixture | null> {
  const data = await apiFetch<ApiResponse>("/fixtures", {
    id: fixtureId.toString(),
  });
  return data.response[0] || null;
}

export async function getAllFixtures(): Promise<ApiFixture[]> {
  const allFixtures: ApiFixture[] = [];

  // Fetch up to 38 rounds
  for (let round = 1; round <= 38; round++) {
    try {
      const fixtures = await getFixturesByRound(round);
      allFixtures.push(...fixtures);
      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 200));
    } catch {
      break; // No more rounds available
    }
  }

  return allFixtures;
}

export function mapStatus(apiStatus: string): "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" {
  switch (apiStatus) {
    case "NS":
    case "TBD":
      return "SCHEDULED";
    case "1H":
    case "2H":
    case "HT":
    case "ET":
    case "P":
    case "LIVE":
      return "LIVE";
    case "FT":
    case "AET":
    case "PEN":
      return "FINISHED";
    case "PST":
      return "POSTPONED";
    default:
      return "SCHEDULED";
  }
}

export function extractRoundNumber(roundStr: string): number {
  const match = roundStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 1;
}
