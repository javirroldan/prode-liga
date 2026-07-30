-- =====================================================
-- PRODE LIGA PROFESIONAL - Tablas
-- Copiar y pegar en: https://supabase.com/dashboard/project/xuytwpjzaglmopfscpyi/sql/new
-- =====================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "supabaseId" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "nickname" TEXT UNIQUE NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "avatar" TEXT,
  "isAdmin" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Tabla de torneos
CREATE TABLE IF NOT EXISTS "Tournament" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "season" TEXT NOT NULL,
  "inviteCode" TEXT UNIQUE NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdBy" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Tabla de participaciones
CREATE TABLE IF NOT EXISTS "Participation" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "tournamentId" TEXT NOT NULL REFERENCES "Tournament"("id") ON DELETE CASCADE,
  "totalPoints" INTEGER DEFAULT 0,
  "joinedAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("userId", "tournamentId")
);

-- Tabla de partidos
CREATE TABLE IF NOT EXISTS "Match" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "apiId" INTEGER UNIQUE,
  "tournamentId" TEXT NOT NULL REFERENCES "Tournament"("id") ON DELETE CASCADE,
  "matchday" INTEGER NOT NULL,
  "date" TIMESTAMPTZ NOT NULL,
  "time" TEXT,
  "homeTeam" TEXT NOT NULL,
  "awayTeam" TEXT NOT NULL,
  "homeLogo" TEXT,
  "awayLogo" TEXT,
  "homeGoals" INTEGER,
  "awayGoals" INTEGER,
  "status" TEXT DEFAULT 'SCHEDULED',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Match_tournamentId_matchday_idx" ON "Match"("tournamentId", "matchday");
CREATE INDEX IF NOT EXISTS "Match_status_idx" ON "Match"("status");

-- Tabla de pronosticos
CREATE TABLE IF NOT EXISTS "Prediction" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "matchId" TEXT NOT NULL REFERENCES "Match"("id") ON DELETE CASCADE,
  "homeGoals" INTEGER NOT NULL,
  "awayGoals" INTEGER NOT NULL,
  "points" INTEGER,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("userId", "matchId")
);

-- Torneo por defecto
INSERT INTO "Tournament" ("id", "name", "season", "inviteCode", "isActive")
VALUES (gen_random_uuid()::text, 'Liga Profesional Argentina 2026', '2026', 'LIGA2026', true)
ON CONFLICT ("inviteCode") DO NOTHING;

-- Partidos de ejemplo fecha 1
DO $$
DECLARE
  t_id TEXT;
BEGIN
  SELECT "id" INTO t_id FROM "Tournament" WHERE "inviteCode" = 'LIGA2026';
  
  INSERT INTO "Match" ("id", "tournamentId", "matchday", "date", "homeTeam", "awayTeam", "status")
  VALUES
    (gen_random_uuid()::text, t_id, 1, '2026-02-15T19:00:00Z', 'River Plate', 'Barracas Central', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-15T21:30:00Z', 'Boca Juniors', 'Independiente', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-16T16:00:00Z', 'Racing Club', 'San Lorenzo', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-16T18:30:00Z', 'Huracan', 'Estudiantes', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-16T21:00:00Z', 'Velez Sarsfield', 'Gimnasia y Esgrima LP', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-17T19:00:00Z', 'Defensa y Justicia', 'Lanus', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-17T21:30:00Z', 'Talleres de Cordoba', 'Belgrano', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-18T19:00:00Z', 'Argentinos Juniors', 'Union Santa Fe', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-18T21:00:00Z', 'Tigre', 'Platense', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-18T23:00:00Z', 'Atletico Tucuman', 'Sarmiento de Junin', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-19T19:00:00Z', 'Central Cordoba', 'Banfield', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-19T21:00:00Z', 'Newells Old Boys', 'Rosario Central', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-19T21:30:00Z', 'Godoy Cruz', 'Colon', 'SCHEDULED'),
    (gen_random_uuid()::text, t_id, 1, '2026-02-19T19:00:00Z', 'Estudiantes de Rio Cuarto', 'Aldosivi', 'SCHEDULED')
  ON CONFLICT DO NOTHING;
END $$;
