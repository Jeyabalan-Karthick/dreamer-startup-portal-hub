-- ============================================
-- SIMPLEST POSSIBLE FIX - COPY ALL BELOW
-- ============================================

-- Step 1: Remove ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'incubation_centres') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.incubation_centres';
    END LOOP;
END $$;

-- Step 2: Create policies exactly like applications table (which works)
CREATE POLICY "Allow anyone to view incubation centres" 
ON public.incubation_centres FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert incubation centres" 
ON public.incubation_centres FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update incubation centres" 
ON public.incubation_centres FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow anyone to delete incubation centres" 
ON public.incubation_centres FOR DELETE USING (true);

