# How to Fix the RLS Error for Incubation Centres

## The Problem
You're getting a `403 Forbidden` error with message: "new row violates row-level security policy for table 'incubation_centres'"

This happens because the Row Level Security (RLS) policies on the `incubation_centres` table are blocking inserts.

## The Solution

### Option 1: Apply via Supabase Dashboard (Easiest - Recommended)

1. **Open your Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `nxsrxdlsnabpshncdplv`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the SQL**
   - Open the file `QUICK_FIX_RLS.sql` in this project
   - Copy ALL the SQL code
   - Paste it into the SQL Editor

4. **Run the SQL**
   - Click the "Run" button (or press Ctrl+Enter)
   - You should see "Success. No rows returned"

5. **Test the Fix**
   - Go back to your admin page
   - Try adding an incubation centre again
   - The error should be gone!

### Option 2: Apply via Supabase CLI (If you have it installed)

```bash
# Make sure you're in the project directory
cd "d:\Dreamers Startup\dreamer-startup-portal-hub"

# Link to your project (if not already linked)
npx supabase link --project-ref nxsrxdlsnabpshncdplv

# Push the migration
npx supabase db push
```

## What the Fix Does

The SQL script:
1. Drops all existing conflicting RLS policies
2. Creates new policies that allow:
   - ✅ SELECT (read) operations
   - ✅ INSERT (create) operations  
   - ✅ UPDATE (modify) operations
   - ✅ DELETE (remove) operations

These policies match the pattern used by your `applications` table, which is working correctly.

## Still Having Issues?

If you still get errors after applying the fix:
1. Check the browser console for any new error messages
2. Verify the SQL ran successfully in Supabase dashboard
3. Try refreshing the page and clearing browser cache

