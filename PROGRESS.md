# Prode Liga Profesional - Estado del Proyecto

## ✅ COMPLETADO

### 1. Setup del proyecto
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 configurado
- package.json con scripts: dev, build, start, lint, db:generate, db:push, db:seed, db:reset, db:studio

### 2. Configuración
- `components.json` - shadcn/ui configurado
- `src/app/globals.css` - Dark theme con variables CSS (verde #22c55e como primary)
- `src/lib/utils.ts` - Función cn()
- `.env.local` / `.env.example` - Variables de entorno (Supabase, API-Football, DB)
- `src/middleware.ts` - Middleware de Supabase auth

### 3. Supabase Client
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client
- `src/lib/supabase/middleware.ts` - Session refresh

### 4. Base de datos (Prisma)
- `prisma/schema.prisma` - Modelos: User, Tournament, Participation, Match, Prediction
- `prisma/seed.ts` - Seed con torneo default "LIGA2026" + 14 partidos fecha 1
- `src/lib/prisma.ts` - PrismaClient singleton

### 5. UI Components (shadcn-style)
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/tabs.tsx`

### 6. Services
- `src/services/scoring.ts` - Motor de scoring (12/5/2/0 puntos)
- `src/services/football-api.ts` - Cliente API-Football (league 128 = Liga Argentina)
- `src/services/sync.ts` - Sync fixture, live scores, cálculo de puntos

### 7. Server Actions
- `src/actions/auth.ts` - register, login, logout, getCurrentUser
- `src/actions/predictions.ts` - submitPrediction, getMatchdayPredictions
- `src/actions/tournaments.ts` - joinTournament, getTournamentRanking, getUserTournaments
- `src/actions/admin.ts` - createTournament, syncMatchday, syncLive, recalculatePoints

### 8. Pages/Layouts
- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Landing page completa (hero, features, scoring rules)
- `src/app/auth/layout.tsx` - Auth layout
- `src/app/auth/login/page.tsx` - Login page
- `src/app/auth/register/page.tsx` - Register page
- `src/components/shared/navbar.tsx` - Navbar con links
- `src/app/dashboard/layout.tsx` - Dashboard layout con navbar
- `src/app/dashboard/page.tsx` - Dashboard con stats, join tournament, matchday grid
- `src/components/fixture/match-card.tsx` - Match card con inputs de predicción
- `src/components/fixture/matchday-selector.tsx` - Selector de fechas

---

## ⏳ PENDIENTE (retomar acá)

### 9. Pages que faltan
- `src/app/fixture/page.tsx` - Fixture completo (todas las fechas)
- `src/app/fixture/layout.tsx` - Layout con navbar
- `src/app/ranking/page.tsx` - Ranking general del torneo
- `src/app/ranking/layout.tsx` - Layout con navbar
- `src/app/admin/page.tsx` - Panel de administración
- `src/app/admin/layout.tsx` - Layout admin

### 10. API Routes (cron jobs)
- `src/app/api/cron/sync/route.ts` - Cron para sync automático de fixture cada 5 min
- `src/app/api/cron/scores/route.ts` - Cron para actualizar resultados en vivo

### 11. Instalar dependencias faltantes
```bash
cd /home/pachu/prode-liga
npm install framer-motion lucide-react clsx tailwind-merge class-variance-authority date-fns zod
npm install @supabase/supabase-js @supabase/ssr prisma @prisma/client
npm install -D tsx
```

### 12. Inicializar Prisma
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 13. Deploy Vercel
- Crear repo en GitHub
- Conectar con Vercel
- Configurar variables de entorno
- Agregar CRON_SECRET

---

## 📁 Estructura de archivos creados

```
prode-liga/
├── .env.local
├── .env.example
├── components.json
├── package.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── predictions.ts
│   │   ├── tournaments.ts
│   │   └── admin.ts
│   ├── components/
│   │   ├── ui/ (8 componentes)
│   │   ├── shared/navbar.tsx
│   │   └── fixture/
│   │       ├── match-card.tsx
│   │       └── matchday-selector.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── prisma.ts
│   │   └── supabase/ (3 archivos)
│   ├── middleware.ts
│   └── services/
│       ├── scoring.ts
│       ├── football-api.ts
│       └── sync.ts
```

## 🔑 Credenciales necesarias (llenar en .env.local)
1. Supabase: crear proyecto gratis en supabase.com
2. API-Football: registrarse en api-football.com (free tier 100 req/día)
3. Vercel: deploy gratis en vercel.com
