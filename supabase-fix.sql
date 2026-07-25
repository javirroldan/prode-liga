-- =====================================================
-- FIX 1: Make the first registered user an admin
-- =====================================================
-- Run AFTER the first person has registered
-- Replace '<user-email>' with the email used to register
UPDATE "User" SET "isAdmin" = true WHERE email = '<user-email>';

-- =====================================================
-- FIX 2: RLS Policies (safety net for future operations)
-- =====================================================
-- These policies are needed because Supabase "Run and enable RLS"
-- button sets default restrictive policies.

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s" ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- USER
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read all users" ON "User" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert users" ON "User" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update own user" ON "User" FOR UPDATE USING (auth.uid() = "supabaseId"::uuid);

-- TOURNAMENT
ALTER TABLE "Tournament" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tournaments" ON "Tournament" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tournaments" ON "Tournament" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- PARTICIPATION
ALTER TABLE "Participation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read participations" ON "Participation" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert participations" ON "Participation" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- MATCH
ALTER TABLE "Match" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read matches" ON "Match" FOR SELECT USING (true);

-- PREDICTION
ALTER TABLE "Prediction" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read all predictions" ON "Prediction" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert predictions" ON "Prediction" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update predictions" ON "Prediction" FOR UPDATE USING (auth.role() = 'authenticated');
