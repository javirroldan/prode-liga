# Prode Liga Profesional - Estado del Proyecto

## ✅ COMPLETADO (100% funcional, build pasa)

### Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **UI**: shadcn-style components (button, card, input, badge, tabs, avatar, separator, label)
- **Auth**: Supabase Auth (email/password)
- **DB**: Supabase PostgreSQL + Prisma ORM
- **API**: API-Football v3 (league 128 = Liga Argentina)
- **Deploy**: Vercel (listo para deployar)

### Archivos (40 archivos)
```
prode-liga/
├── prisma/
│   ├── schema.prisma          # User, Tournament, Participation, Match, Prediction
│   └── seed.ts                # Torneo LIGA2026 + 14 partidos fecha 1
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (dark theme)
│   │   ├── page.tsx           # Landing page (hero, features, scoring rules)
│   │   ├── globals.css        # Dark theme CSS variables
│   │   ├── auth/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx       # Stats + join tournament + matchday grid
│   │   ├── fixture/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx       # Fixture completo con filtros
│   │   ├── ranking/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx       # Leaderboard + stats
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx       # Panel admin (sync, scoring, users)
│   │   └── api/cron/
│   │       ├── sync/route.ts  # Cron sync fixture
│   │       └── scores/route.ts # Cron calc points
│   ├── actions/
│   │   ├── auth.ts            # register, login, logout, getCurrentUser
│   │   ├── predictions.ts     # submitPrediction, getMatchdayPredictions
│   │   ├── tournaments.ts     # joinTournament, getTournamentRanking
│   │   └── admin.ts           # createTournament, sync, recalculate
│   ├── components/
│   │   ├── ui/ (8 componentes)
│   │   ├── shared/
│   │   │   ├── navbar.tsx
│   │   │   └── join-tournament-form.tsx
│   │   ├── fixture/
│   │   │   ├── match-card.tsx
│   │   │   └── matchday-selector.tsx
│   │   └── admin/
│   │       └── admin-actions.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── prisma.ts
│   │   └── supabase/ (3 archivos)
│   ├── middleware.ts
│   └── services/
│       ├── scoring.ts         # Motor de scoring (12/5/2/0 pts)
│       ├── football-api.ts    # Cliente API-Football
│       └── sync.ts            # Sync fixture, live scores, calc points
```

### Reglas de puntaje
| Resultado | Puntos |
|-----------|--------|
| Resultado exacto | 12 |
| Ganador/empate correcto | 5 |
| Goles de UN equipo | 2 |
| **Máximo por partido** | **12** |

### Pantallas
| Ruta | Descripción |
|------|-------------|
| `/` | Landing page (pública) |
| `/auth/login` | Iniciar sesión |
| `/auth/register` | Registrarse |
| `/dashboard` | Fecha actual + cargar pronósticos |
| `/fixture` | Fixture completo por fecha + filtros |
| `/ranking` | Ranking general del torneo |
| `/admin` | Panel admin (solo admins) |

---

## 🚀 PARA DEPLOYAR

### 1. Configurar .env.local
```bash
cd /home/pachu/prode-liga
# Editar .env.local con tus credenciales:
# - Supabase: crear proyecto en supabase.com
# - API-Football: registrarse en api-football.com (free 100 req/día)
```

### 2. Configurar Supabase
1. Crear proyecto en https://supabase.com
2. Ir a SQL Editor y ejecutar:
```sql
-- Crear tablas (copiar de prisma/schema.prisma y adaptar)
-- O usar: npx prisma db push (requiere DB_URL)
```
3. Copiar Project URL y anon key a .env.local

### 3. Configurar API-Football
1. Registrarse en https://www.api-football.com
2. Copiar API key a .env.local (FOOTBALL_API_KEY)

### 4. Deploy en Vercel
```bash
# Opción A: GitHub + Vercel
git remote add origin <tu-repo>
git push -u origin master
# Conectar repo en vercel.com

# Opción B: CLI
npx vercel --prod
```

### 5. Variables de entorno en Vercel
Agregar todas las variables de .env.local en Vercel Dashboard → Settings → Environment Variables

### 6. Cron Jobs (opcional)
En Vercel, configurar en vercel.json:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/scores",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

---

## 📋 Git History
- `6251bde` - WIP: setup + schema + auth + dashboard + services
- `ee507d8` - feat: add fixture, ranking, admin pages + fix TypeScript errors

## 🔑 Credenciales necesarias
1. **Supabase**: https://supabase.com (gratis)
2. **API-Football**: https://api-football.com (free tier 100 req/día)
3. **Vercel**: https://vercel.com (gratis)
