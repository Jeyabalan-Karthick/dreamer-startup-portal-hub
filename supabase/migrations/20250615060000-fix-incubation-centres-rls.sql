-- Fix RLS policies for incubation_centres table
-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Anyone can insert incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Anyone can update incubation centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "Anyone can delete incubation centres" ON public.incubation_centres;

-- Create more permissive policies for admin functionality
-- Allow anyone to read incubation centres
CREATE POLICY "Allow public read access to incubation centres" 
ON public.incubation_centres 
FOR SELECT 
USING (true);

-- Allow anyone to insert incubation centres (for admin panel)
CREATE POLICY "Allow public insert access to incubation centres" 
ON public.incubation_centres 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update incubation centres
CREATE POLICY "Allow public update access to incubation centres" 
ON public.incubation_centres 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow anyone to delete incubation centres
CREATE POLICY "Allow public delete access to incubation centres" 
ON public.incubation_centres 
FOR DELETE 
USING (true);
