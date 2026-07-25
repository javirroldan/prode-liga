# AGENTS.md - Prode Liga

## Project Overview
App de pronósticos (prode) para la Liga Profesional Argentina. Los usuarios se registran, se unen a un torneo, cargan pronósticos de goles por partido y compiten en un ranking.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
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

## Scoring Rules
- 12 puntos: resultado exacto
- 5 puntos: acierta ganador/empate
- 2 puntos: acierta goles de UN solo equipo
- Máximo 12 puntos por partido

## Key Features
- **Fixture real**: Clausura 2026, 16 fechas, 15 partidos por fecha (1 interzonal + 7 zona A + 7 zona B), 30 equipos
- **Carga manual de resultados**: Admin ingresa goles, una vez guardado no se puede modificar
- **Bloqueo automático**: Pronósticos se bloquean 1 hora antes del inicio del partido
- **Invite code**: `LIGA2026` para unirse al torneo

## File Structure
```
src/
├── actions/          # Server actions
│   ├── auth.ts       # register, login, logout, getCurrentUser
│   ├── predictions.ts # submitPrediction, getMatchdayPredictions
│   ├── tournaments.ts # joinTournament, getTournamentRanking, getUserTournaments
│   └── admin.ts      # submitMatchResult, getMatchdayResults, createTournament
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/login/page.tsx   # Login
│   ├── auth/register/page.tsx # Register
│   ├── dashboard/page.tsx    # Main dashboard with matchday grid
│   ├── fixture/page.tsx      # Fixture browser
│   ├── ranking/page.tsx      # Leaderboard
│   └── admin/page.tsx        # Admin panel (result entry)
├── components/
│   ├── ui/           # Reusable UI components (button, card, input, etc.)
│   ├── fixture/      # match-card.tsx, matchday-selector.tsx
│   ├── shared/       # join-tournament-form.tsx
│   └── admin/        # result-entry-form.tsx
├── lib/
│   ├── prisma.ts     # Prisma client singleton
│   ├── supabase/     # server.ts, client.ts, middleware.ts
│   ├── utils.ts      # cn() helper
│   └── match-utils.ts # isMatchLocked() - time-based prediction locking
├── services/
│   └── scoring.ts    # calculatePoints()
└── middleware.ts     # Auth middleware
```

## Prisma Schema (Key Models)
- **User**: id, supabaseId, name, nickname, email, isAdmin
- **Tournament**: id, name, season, inviteCode, isActive
- **Participation**: id, userId, tournamentId, totalPoints
- **Match**: id, apiId, tournamentId, matchday, date, time, homeTeam, awayTeam, homeGoals, awayGoals, status (enum: SCHEDULED, LIVE, FINISHED, POSTPONED)
- **Prediction**: id, userId, matchId, homeGoals, awayGoals, points

## Deployment
- **GitHub**: `https://github.com/javirroldan/prode-liga`
- **Vercel**: `https://prode-liga.vercel.app`
- Auto-deploys on push to `main` branch
- Environment variables configured in Vercel dashboard

## Known Issues / Notes
- API-Football free plan only supports seasons 2022-2024, not 2026
- Match status is manually updated by admin (no auto-sync from API)
- `NEXT_PUBLIC_APP_URL` should be set to `https://prode-liga.vercel.app` in Vercel
- Scripts in `/scripts` folder are excluded from TypeScript compilation (tsconfig exclude)
- Supabase email confirmation should be disabled for easy registration
- First admin user: `javiroldan` (ricardojroldan@gmail.com)

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build (must pass before deploy)
- `npx prisma generate` - Regenerate Prisma client
- `npx prisma db push` - Sync schema to DB (needs both DATABASE_URL and DIRECT_URL env vars)
