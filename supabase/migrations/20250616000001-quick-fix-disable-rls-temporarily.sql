-- TEMPORARY FIX: Disable RLS for incubation_centres table
-- WARNING: This makes the table publicly accessible. Use only for testing.
-- For production, use the proper RLS policies from the previous migration.

-- Disable RLS temporarily
ALTER TABLE public.incubation_centres DISABLE ROW LEVEL SECURITY;

-- NOTE: After testing, re-enable RLS and apply the proper policies:
-- ALTER TABLE public.incubation_centres ENABLE ROW LEVEL SECURITY;
-- Then run the migration: 20250616000000-fix-incubation-centres-rls-final.sql

