-- QUICK FIX: Run this SQL in your Supabase Dashboard > SQL Editor
-- This will fix the RLS policy issue for incubation_centres table

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Anyone can insert incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Anyone can update incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Anyone can delete incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Allow public read access to incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Allow public insert access to incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Allow public update access to incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Allow public delete access to incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "public_select_incubation_centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "public_insert_incubation_centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "public_update_incubation_centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "public_delete_incubation_centres" ON public.incubation_centres;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.incubation_centres ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new policies that allow all operations (matching the applications table pattern)
-- Note: Not specifying TO clause means it applies to all roles including anon
CREATE POLICY "Allow anyone to view incubation centres" 
ON public.incubation_centres 
FOR SELECT 
USING (true);

CREATE POLICY "Allow anyone to insert incubation centres" 
ON public.incubation_centres 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anyone to update incubation centres" 
ON public.incubation_centres 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anyone to delete incubation centres" 
ON public.incubation_centres 
FOR DELETE 
USING (true);

