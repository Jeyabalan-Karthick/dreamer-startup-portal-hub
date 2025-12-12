-- ============================================
-- DIAGNOSTIC: Check current RLS policies
-- Run this FIRST to see what policies exist
-- ============================================

-- Check if RLS is enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'incubation_centres';

-- List all current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'incubation_centres'
ORDER BY policyname;

