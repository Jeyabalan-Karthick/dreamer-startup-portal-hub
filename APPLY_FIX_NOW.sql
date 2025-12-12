-- ============================================
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard/project/nxsrxdlsnabpshncdplv/sql/new
-- ============================================

-- Comprehensive fix for incubation_centres RLS policies
-- This matches the exact pattern used by the applications table (which works)

-- Step 1: Remove ALL existing policies automatically
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'incubation_centres') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.incubation_centres';
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.incubation_centres ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies exactly like applications table (which works)
CREATE POLICY "Allow anyone to view incubation centres" 
ON public.incubation_centres FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert incubation centres" 
ON public.incubation_centres FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update incubation centres" 
ON public.incubation_centres FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow anyone to delete incubation centres" 
ON public.incubation_centres FOR DELETE USING (true);

