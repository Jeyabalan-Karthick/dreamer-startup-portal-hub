-- ============================================
-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- ============================================
-- Go to: https://supabase.com/dashboard/project/nxsrxdlsnabpshncdplv/sql/new
-- Then paste this and click RUN
-- ============================================

-- Remove all old policies
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
DROP POLICY IF EXISTS "anon_select_incubation_centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "anon_insert_incubation_centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "anon_update_incubation_centres" ON public.incubation_centres;
DROP POLICY IF EXISTS "anon_delete_incubation_centres" ON public.incubation_centres;

-- Create new policies (same pattern as applications table which works)
CREATE POLICY "Allow anyone to view incubation centres" 
ON public.incubation_centres FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert incubation centres" 
ON public.incubation_centres FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update incubation centres" 
ON public.incubation_centres FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow anyone to delete incubation centres" 
ON public.incubation_centres FOR DELETE USING (true);

