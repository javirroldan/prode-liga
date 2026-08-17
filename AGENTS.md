# AGENTS.md - Prode Liga

## Project Overview
App de pronósticos (prode) para la Liga Profesional Argentina. Los usuarios se registran, se unen a un torneo, cargan pronósticos de goles por partido y compiten en un ranking.

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **UI**: Componentes estilo shadcn (button, card, input, label, badge, separator, avatar, tabs)
- **Database**: Supabase PostgreSQL + Prisma ORM (v6.19.3)
- **Auth**: Supabase Auth (email/password)
- **Deploy**: Vercel (auto-deploy from GitHub)
- **Node**: v22.22.2

## Supabase
- **Project**: `xuytwpjzaglmopfscpyi`
- **URL**: From env `NEXT_PUBLIC_SUPABASE_URL`
- **Pooler**: `aws-0-us-east-1.pooler.supabase.com:6543`

## Database URL
Must include `?pgbouncer=true` in the connection string for Prisma + Supabase pooler compatibility.
Credentials are in `.env.local` and Vercel environment variables.

## API
- **API-Football**: Key in env `FOOTBALL_API_KEY` (plan gratis, solo datos 2022-2024, NO sirve para temporada 2026)

## BeSoccer API (integración activa)
- **Base**: `http://apiclient.besoccerapps.com/scripts/api/api.php` (HTTP, NO HTTPS). Auth por query param `key=` (env `BESOCCER_API_KEY`). Caché 60-600 s.
- **Doc oficial**: colección Postman en https://documenter.getpostman.com/view/6414020/2s93JwM1t4
- **Endpoints**: `req=matchs&league=<id>&round=<jornada>&year=<año>&tz=<zona>`, `req=matchsday`, `req=live_matches`, `req=tables&league=<id>&group=<n>`, `req=teams&league=<id>`, `req=seasons&id=<id>`, `req=competition&id=<id>`, `req=data_competitions&competitions=<id>`, `req=categories&filter=my_leagues`, `req=competitions&country=<iso>`
- **IMPORTANTE**: para la Clausura `req=matchs` usa el parámetro **`round`** (NO `group`, que devuelve `match:[]` vacío)
- **Clausura Argentina**: id **118** (alias `torneo_final`), year 2026, 16 jornadas, 30 equipos — coincide con el fixture del proyecto. Se descubre con `req=competitions&country=ar`
- **Acceso**: la key ya incluye la Clausura (pedida y otorgada por soporte). `my_leagues` la lista; `tables`, `matchsday`, `matchs` funcionan. Respuesta `no-version.` = key inválida/ausente (en tests inline cargar siempre con `--env-file=.env.local`)
- **Campos req=matchs**: `id`→apiId, `local`/`visitor`→equipos, `local_goals`/`visitor_goals`→goles (`"x"` si no jugado), `round`→matchday, `schedule` (`YYYY-MM-DD HH:MM:SS` hora local con `tz`)→fecha/hora, `status` (`-1`=Sin comenzar, `1`=Final), `local_abbr`/`visitor_abbr`→abreviaturas
- **Normalización de nombres**: 11 overrides BeSoccer→DB en `src/lib/besoccer.ts` (ej: `Talleres Córdoba`→`Talleres`, `Atl. Tucumán`→`Atlético Tucumán`, `CA Huracán`→`Huracán`)
- **Placeholder**: fechas 8-16 aún no confirmadas por AFA; BeSoccer también las trae estimadas (todos los partidos con la misma fecha/hora 16:00). El sync detecta esto y NO toca fechas existentes
- **Pruebas**: `node --env-file=.env.local scripts/test-besoccer.ts [country] [leagueId] [round] [year]` (no toca la DB)
- **Sync manual**: `node --env-file=.env.local scripts/sync-from-besoccer.ts [roundStart] [roundEnd]` (in-place, NO borra; sin args sincroniza 1-16)
- **Sync automático**: GitHub Actions (`.github/workflows/sync-besoccer.yml`, repo público = gratis, NO cron de Vercel: plan Hobby solo permite 1 cron/día). Llaman al endpoint `app/api/cron/sync-besoccer` con header `Authorization: Bearer $CRON_SECRET` (secret en GitHub Actions):
  - **`*/5 * * * *` + offsets** → `?mode=results` (default): rondas current-1..current+1, pero SOLO consulta BeSoccer si hay partidos a **±3h del kickoff** (`window:false` = 0 peticiones). Resultados auto ~5 min post pitazo. 3 crons offseteados (*/5 + 2-57/5 + 4-59/5) para compensar delays de GitHub Actions
  - **`0 8 * * *`** (1x/día) → `?mode=fixture`: rondas current+1..current+2 sin límite de ventana (2 peticiones) para captar fechas de agenda AFA
- **Cuota BeSoccer**: 500 peticiones/día (resetea a las 0h). Consumo con este diseño: ~2/día sin partidos, ~120-210/día con partidos. No usar el endpoint en modo results fuera de ventana para no gastar cuota

## Scoring Rules
- 12 puntos: resultado exacto (badge amarillo)
- 7 puntos: acierta ganador/empate + goles de UN equipo (badge verde)
- 5 puntos: acierta ganador/empate (badge azul)
- 2 puntos: acierta goles de UN solo equipo (badge naranja)
- 0 puntos: nada correcto
- Máximo 12 puntos por partido

## Key Features
- **Fixture real**: Clausura 2026, 16 fechas, 15 partidos por fecha (1 interzonal + 7 zona A + 7 zona B), 30 equipos. Fechas 4-7 con días/horarios oficiales de AFA (agenda publicada 02/08/2026); fechas 8-16 con fechas estimadas semanales hasta que AFA confirme
- **Auto-sync BeSoccer**: GitHub Actions cada 15 min durante la ventana de partidos (±3h del kickoff) + 1 pasada diaria de fechas. Actualiza fecha/hora (solo si hay horarios reales, no placeholders), goles y estado FINISHED desde BeSoccer, y recalcula puntos. Los partidos con `manualResult=true` (editados/reabiertos por admin) no se sobreescriben
- **Carga manual de resultados**: Admin ingresa goles
- **Corrección de resultados**: Matches FINISHED se pueden re-editar (el admin puede corregir goles)
- **Reabrir partidos**: Admin puede cambiar status FINISHED → LIVE (resetea goles y puntos)
- **Actualización parcial**: En partidos LIVE, admin puede actualizar goles sin finalizar ("Actualizar parcial" + "Finalizar")
- **Bloqueo automático**: Pronósticos se bloquean 30 minutos antes del inicio del partido
- **Convención de fecha/hora**: `Match.date` guarda el **instante real en UTC** (el `schedule` de BeSoccer viene en hora local argentina y se convierte con offset `-03:00`). `Match.time` es la hora local AR de display `"HH:MM"`. La hora local se muestra usando `time`, y el día con `toLocaleDateString` en el browser. NUNCA sumar/restar horas a mano (histórico: antes se guardaba hora local como si fuera UTC y se compensaba con +3h en algunos lados, lo que rompía la ventana del sync)
- **Auto-detección fecha actual**: Basada en fecha del primer partido (compara solo fecha, sin hora — a partir de las 00:00 del día que se juega, se muestra esa fecha). Tanto dashboard, fixture como admin muestran la fecha actual por defecto
- **Banner "Fecha finalizada"**: Aparece arriba de los partidos cuando toda la fecha está completada
- **Predicción del usuario en cards**: Muestra `(vos: X - X)` en amarillo pastel
- **Invite code**: `LIGA2026` para unirse al torneo
- **Recuperación de contraseña**: Flujo forgot-password → email Supabase → callback → update-password
- **Reset de fecha**: Admin puede reiniciar toda una fecha ("Reiniciar fecha X")
- **Ranking con desempate**: Orden por puntos, luego por más predicciones de 12, 7, 5, 2
- **Ranking por fecha**: Tab que muestra quién ganó cada fecha
- **Estadísticas**: Desglose de predicciones por tier (12, 7, 5, 2, 0) por usuario
- **Escudos de equipos**: Logos PNG en `public/logos/`, mapping en `src/lib/team-logos.ts`, mostrados en admin y fixture (match-card). Normalizados a fill ~45% del canvas 1500x1500 (12 equipos con padding excesivo recortados: Aldosivi, Racing, Estudiantes LP, Belgrano, River Plate, Argentinos Juniors, Rosario Central, Instituto, Independiente, Newell's, Huracán, Banfield; Argentinos quedó en 50% por pedido del admin). Talleres NO se tocó. `getTeamLogo()` agrega `?v=LOGO_VERSION` (cache-buster): al cambiar logos, subir `LOGO_VERSION` en team-logos.ts
- **Nombres display acortados**: `src/lib/team-display.ts` acorta nombres que se rompen en dos líneas en mobile: "Argentinos Juniors"→"Argentinos", "Defensa y Justicia"→"Defensa" (y otros). Solo afecta display, no el matcheo de BeSoccer (usa el nombre completo de la DB)
- **Quitar usuarios del torneo**: Admin puede eliminar participantes desde admin/page.tsx
- **Partidos postergados**: Admin puede marcar partidos como POSTPONED. Se muestran en banner separado al final del dashboard. Si el partido tiene fecha futura, queda bloqueado; cuando la fecha llega, se activa automáticamente y permite pronósticos (bloquea 1 hora antes del kickoff como cualquier partido)

## File Structure
```
src/
├── actions/          # Server actions
│   ├── auth.ts       # register, login, logout, getCurrentUser, forgotPassword, updatePassword
│   ├── predictions.ts # submitPrediction, getMatchdayPredictions
│   ├── tournaments.ts # joinTournament, getTournamentRanking, getUserTournaments,
│   │                   # getRankingWithTiebreak, getMatchdayRanking, getUserStats, getAvailableMatchdays
│   └── admin.ts      # submitMatchResult, getMatchdayResults, createTournament,
│                       # resetMatchday, setMatchStatus (SCHEDULED/LIVE/POSTPONED), updateLiveScore,
│                       # removeUserFromTournament, getTournamentParticipants
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/login/page.tsx   # Login
│   ├── auth/register/page.tsx # Register
│   ├── auth/forgot-password/page.tsx # Forgot password
│   ├── auth/callback/route.ts # Supabase code exchange for password reset
│   ├── auth/update-password/page.tsx # Update password
│   ├── dashboard/page.tsx    # Main dashboard with matchday grid
│   ├── fixture/page.tsx      # Fixture browser
│   ├── ranking/page.tsx      # Leaderboard with tabs (General / Por Fecha / Estadísticas)
│   ├── admin/page.tsx        # Admin panel (result entry)
│   └── api/cron/sync-besoccer/route.ts # Sync desde BeSoccer (?mode=results ventana ±3h | ?mode=fixture fechas futuras)
├── components/
│   ├── ui/           # Reusable UI components (button, card, input, etc.)
│   ├── fixture/      # match-card.tsx (with color-coded PointsBadge), matchday-selector.tsx
│   ├── shared/       # join-tournament-form.tsx
│   ├── admin/
│   │   ├── result-entry-form.tsx
│   │   └── user-management.tsx    # Quitar participantes del torneo
│   └── ranking-tabs.tsx # Client wrapper for ranking tabs (reads searchParams)
├── lib/
│   ├── prisma.ts     # Prisma client singleton
│   ├── supabase/     # server.ts, client.ts, middleware.ts
│   ├── utils.ts      # cn() helper
│   ├── team-logos.ts   # Mapping equipo→logo (/logos/xxx.png) + cache-buster ?v=LOGO_VERSION
│   ├── team-display.ts # Nombres acortados para display mobile (getTeamDisplayName)
│   ├── besoccer.ts     # Cliente API BeSoccer + normalización de nombres + fetchMatchday
│   └── match-utils.ts # isMatchLocked(), getCurrentMatchday()
├── services/
│   ├── scoring.ts    # calculatePoints() - returns 12, 7, 5, 2, or 0
│   └── sync.ts       # calculateAndStorePoints() - batch recalculation
├── middleware.ts     # Auth middleware
└── equipos_liga_argentina_2026.json # Mapping nombre completo → abreviatura (3 letras) de los 30 equipos

scripts/
├── load-real-fixture.ts    # Fuente del fixture 2026 (fechas 4-7 reales AFA, 8-16 estimadas). BORRA predicciones y partidos al correr
├── load-clausura-fixture.ts # (obsoleto) Fixture genérico, todos los partidos del matchday el mismo día
├── update-fixture-dates.ts  # Actualiza fecha/hora de partidos existentes SIN borrar (matchea por matchday + homeTeam + awayTeam)
└── sync-from-besoccer.ts    # Sync in-place desde BeSoccer (apiId, fecha/hora si no es placeholder, goles/estado FINISHED + recuento de puntos)

.github/workflows/
└── sync-besoccer.yml        # Scheduler: */5 results (ventana ±3h) + 0 8 * * * fixture (1x/día), header CRON_SECRET
```

## Prisma Schema (Key Models)
- **User**: id, supabaseId, name, nickname, email, isAdmin
- **Tournament**: id, name, season, inviteCode, isActive
- **Participation**: id, userId, tournamentId, totalPoints
- **Match**: id, apiId, tournamentId, matchday, date, time, homeTeam, awayTeam, homeGoals, awayGoals, status (enum: SCHEDULED, LIVE, FINISHED, POSTPONED), manualResult (bool, true si fue editado/reabierto por admin → el sync no lo sobreescribe)
- **Prediction**: id, userId, matchId, homeGoals, awayGoals, points

## Deployment
- **GitHub**: `https://github.com/javirroldan/prode-liga`
- **Vercel**: `https://prode-liga.vercel.app`
- Auto-deploys on push to `main` branch
- Environment variables configured in Vercel dashboard (incluye `BESOCCER_API_KEY` y `CRON_SECRET`)
- `CRON_SECRET` además es **secret de GitHub Actions** (Settings → Secrets and variables → Actions) para el workflow de sync

## Known Issues / Notes
- API-Football free plan only supports seasons 2022-2024, not 2026
- Código de estado LIVE de BeSoccer sin confirmar (solo se conocen -1=SCHEDULED y 1=FINISHED). Los partidos LIVE/POSTPONED quedan manuales hasta confirmar
- LIVE automático (goles parciales + badge "EN VIVO") diferido: en prueba gratis de la API por 7 días. Si se contrata la API, evaluar detección de LIVE con `req=live_matches`
- `NEXT_PUBLIC_APP_URL` should be set to `https://prode-liga.vercel.app` in Vercel
- Scripts in `/scripts` folder are excluded from TypeScript compilation (tsconfig exclude)
- Supabase email confirmation should be disabled for easy registration
- First admin user: `pachu` (pachu.hyper@gmail.com)
- PWA: install on Android shows "Crear acceso directo" instead of "Instalar app"
- Service Worker solo se registra en production (no en localhost) para evitar errores de ChunkLoadError en dev
- Admin mobile: cards con layout apilado (equipo+input por fila), botón Reiniciar arriba del selector
- Team logos: 30 equipos mapeados en team-logos.ts, mostrados en admin y fixture. Cache-buster `?v=LOGO_VERSION`: al reemplazar un logo, subir la versión en team-logos.ts para forzar refresh del browser
- Nombres de equipos normalizados. Mapping completo en equipos_liga_argentina_2026.json
- Hay overrides en src/lib/team-abbrevs.ts para nombres que no matchean exacto entre DB y JSON
- Fechas 8-16 del fixture tienen fechas estimadas semanales. Cuando AFA confirme la agenda, corregir con scripts/update-fixture-dates.ts
- scripts/load-real-fixture.ts BORRA todas las predicciones y partidos al ejecutarse. Para corregir fechas usar SIEMPRE update-fixture-dates.ts, nunca recargar el fixture completo

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build (must pass before deploy)
- `npx prisma generate` - Regenerate Prisma client
- `npx prisma db push` - Sync schema to DB (needs both DATABASE_URL and DIRECT_URL env vars). NOTA: actualmente no funciona con el pooler (se cuelga). Aplicar cambios de schema con ALTER/DML vía PrismaClient runtime
- `node --env-file=.env.local scripts/update-fixture-dates.ts` - Actualizar días/horarios de partidos según agenda AFA (in-place, conserva resultados y pronósticos)
- `node --env-file=.env.local scripts/sync-from-besoccer.ts [roundStart] [roundEnd]` - Sincronizar fixture/resultados desde BeSoccer (in-place, sin args = 1-16)
