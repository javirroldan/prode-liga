// Prueba de la API de BeSoccer (plan con acceso a la Clausura Argentina).
// Uso: node --env-file=.env.local scripts/test-besoccer.ts [country] [leagueId] [round] [year]
//   - country:  código ISO del país a explorar (default "ar")
//   - leagueId: competición a probar con req=matchs (default: Clausura Argentina 118)
//   - round:    jornada (default 5)
//   - year:     temporada (default 2026)
// No modifica la base de datos ni la app. Solo imprime respuestas.
//
// Nota: req=matchs usa el parámetro `round` (NO `group`) para la Clausura.

const API_BASE = "http://apiclient.besoccerapps.com/scripts/api/api.php";

async function callApi(params: Record<string, string>): Promise<{ status: number; json: any }> {
  const url = new URL(API_BASE);
  url.searchParams.set("key", process.env.BESOCCER_API_KEY || "");
  url.searchParams.set("format", "json");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

function describe(obj: any): string {
  if (Array.isArray(obj)) return `array(${obj.length})`;
  if (obj && typeof obj === "object") {
    return `object{${Object.keys(obj).join(", ")}}`;
  }
  return String(obj);
}

async function step(name: string, params: Record<string, string>, limit = 2500) {
  console.log(`\n===== ${name} =====`);
  console.log(`GET ${API_BASE}?${Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&")}`);
  const { status, json } = await callApi(params);
  console.log(`HTTP ${status} -> ${describe(json)}`);
  const str = JSON.stringify(json, null, 2);
  console.log(str.slice(0, limit));
  return json;
}

async function main() {
  const key = process.env.BESOCCER_API_KEY;
  if (!key) {
    console.error("Falta BESOCCER_API_KEY en .env.local");
    process.exit(1);
  }
  console.log(`API key presente: ${key.slice(0, 6)}...${key.slice(-4)}`);

  const [country = "ar", leagueArg = "118", roundArg = "5", yearArg = "2026"] = process.argv.slice(2);
  const round = roundArg;
  const year = yearArg;

  // 1. Competiciones disponibles en el plan (matchs accesibles)
  const myLeagues = await step(
    "1. Ligas del plan (req=categories&filter=my_leagues)",
    { req: "categories", filter: "my_leagues", tz: "America/Argentina/Buenos_Aires" }
  );
  const myList: any[] = myLeagues?.category || [];
  console.log("\nLigas con acceso a partidos:");
  for (const l of myList) {
    console.log(`  - id=${l.id} "${l.name}" (${l.country}) rounds=${l.total_rounds}`);
  }

  // 2. Competiciones de un país (descubrir Clausura Argentina)
  const countryComp = await step(
    `2. Competiciones de ${country.toUpperCase()} (req=competitions&country=${country})`,
    { req: "competitions", country, tz: "America/Argentina/Buenos_Aires" },
    4000
  );
  const cats: any[] = countryComp?.category || [];
  console.log("\nCompeticiones encontradas:");
  for (const c of cats) {
    const p = c.phases?.[0];
    console.log(
      `  - id=${c.id} "${c.name}" | year=${c.year} | rounds=${p?.total_rounds ?? "?"} | teams=${p?.total_teams ?? "?"} | current_round=${p?.current_round ?? "?"}`
    );
  }
  const clausura = cats.find((c: any) => /clausura/i.test(c.name || ""));
  const leagueId = clausura ? String(clausura.id) : leagueArg;
  console.log(`\n>>> Competición de prueba: id=${leagueId}`);

  // 3. Partidos por jornada de la competición elegida
  const matches = await step(
    `3. Partidos jornada ${round} (req=matchs&league=${leagueId}&round=${round}&year=${year})`,
    { req: "matchs", league: leagueId, round, year, tz: "America/Argentina/Buenos_Aires" }
  );

  if (matches?.error || !Array.isArray(matches?.match)) {
    console.log("\n[restricción] Esta competición no está incluida en el plan.");
    console.log("Mapeo de campos req=matchs (visto con una liga accesible):");
    console.log(`  id -> apiId | local/visitor -> home/away | local_goals/visitor_goals -> goles`);
    console.log(`  round -> matchday | schedule -> date+time | status -> estado | local_abbr/visitor_abbr -> abreviatura`);
  } else {
    const m = (matches?.match || [])[0];
    if (m) {
      console.log("\nResumen del primer partido:");
      for (const f of ["id", "round", "local", "visitor", "local_abbr", "visitor_abbr", "schedule", "local_goals", "visitor_goals", "status", "status_detail_text", "result"]) {
        console.log(`  ${f}: ${JSON.stringify(m[f])}`);
      }
    }
  }

  // 4. Partidos del día
  await step("4. Partidos del día (req=matchsday)", { req: "matchsday", tz: "America/Argentina/Buenos_Aires" });

  // 5. Partidos en directo
  await step("5. Partidos en directo (req=live_matches)", { req: "live_matches" });

  // 6. Clasificación (la del plan o la elegida)
  await step(
    `6. Clasificación (req=tables&league=${leagueId}&group=1)`,
    { req: "tables", league: leagueId, group: "1" }
  );
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
