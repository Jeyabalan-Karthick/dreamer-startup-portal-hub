-- Comprehensive fix for incubation_centres RLS policies
-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Anyone can insert incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Anyone can update incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Anyone can delete incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Allow public read access to incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Allow public insert access to incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Allow public update access to incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Allow public delete access to incubation centres" ON public.incubation_centres;

-- Ensure RLS is enabled
ALTER TABLE public.incubation_centres ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for everyone (public access)
-- This is needed for the admin panel to work without authentication
CREATE POLICY "public_select_incubation_centres" 
ON public.incubation_centres 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "public_insert_incubation_centres" 
ON public.incubation_centres 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "public_update_incubation_centres" 
ON public.incubation_centres 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "public_delete_incubation_centres" 
ON public.incubation_centres 
FOR DELETE 
TO public
USING (true);

