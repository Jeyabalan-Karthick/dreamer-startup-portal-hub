# 🔴 URGENT: Fix RLS Error - You MUST Do This!

## ❌ Current Error
```
"new row violates row-level security policy for table 'incubation_centres'"
```

## ✅ Solution: Run SQL in Supabase Dashboard

**This CANNOT be fixed from code. You MUST run SQL in Supabase Dashboard.**

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. Login with your account
3. Click on project: **nxsrxdlsnabpshncdplv**

### Step 2: Open SQL Editor
1. In the **left sidebar**, find and click **"SQL Editor"** (database icon)
2. Click the **"New query"** button (top right, blue button)

### Step 3: Copy the SQL
1. Open file: **`SIMPLE_FIX.sql`** (in your project folder)
2. **Select ALL** text (Ctrl+A)
3. **Copy** (Ctrl+C)

### Step 4: Paste and Run
1. Go back to Supabase SQL Editor
2. **Paste** the SQL (Ctrl+V)
3. Click **"RUN"** button (or press Ctrl+Enter)
4. Wait for: **"Success. No rows returned"** ✅

### Step 5: Test
1. Go back to your admin page
2. Refresh the page (F5)
3. Try adding an incubation centre
4. **It should work now!** 🎉

---

## 📁 Which SQL File to Use?

- **`SIMPLE_FIX.sql`** ← **USE THIS ONE** (Simplest, removes all old policies automatically)
- `FIX_RLS_NOW.sql` (Alternative, also works)

---

## ❓ Why This Is Needed?

The `incubation_centres` table has Row Level Security (RLS) enabled, but the current policies are blocking inserts. The SQL fix:
- ✅ Removes all old blocking policies
- ✅ Creates new policies that allow inserts (same as your working `applications` table)

---

## 🆘 Still Not Working?

1. **Check you see "Success"** in Supabase SQL Editor
2. **Refresh your browser** (F5 or Ctrl+R)
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Check browser console** for new errors
5. Run `CHECK_CURRENT_POLICIES.sql` to see what policies exist

---

## ⚠️ Important

**You cannot fix this from your code.** RLS policies are database-level security rules that must be changed in the database itself. This is a security feature of Supabase/PostgreSQL.

