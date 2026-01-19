# Database Setup Guide for Supabase

## ⚠️ Important: Run Migrations in Supabase Dashboard (NOT Vercel)

Database migrations must be run in your **Supabase Dashboard**, not in Vercel. Vercel only runs your application code.

---

## Step-by-Step: Running Database Migrations

### Step 1: Open Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your project
3. Click on **"SQL Editor"** in the left sidebar

### Step 2: Run the Initial Migration

1. Click **"New Query"** button
2. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

**What this does:**
- ✅ Creates `profiles` table
- ✅ Creates `ai_tools` table
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates indexes for performance
- ✅ Sets up triggers for profile creation

### Step 3: Verify Tables Were Created

1. Go to **"Table Editor"** in the left sidebar
2. You should see:
   - ✅ `profiles` table
   - ✅ `ai_tools` table

### Step 4: Check RLS Policies

1. Go to **"Authentication" → "Policies"** in the left sidebar
2. Select the `profiles` table
3. You should see these policies:
   - "Public profiles are viewable by everyone"
   - "Users can update their own profile"
   - "Users can insert their own profile"
4. Select the `ai_tools` table
5. You should see these policies:
   - "AI tools are viewable by everyone"
   - "Users can create AI tools"
   - "Users can update their own AI tools"
   - "Users can delete their own AI tools"

---

## Optional: Run Additional Migrations

If you have other migration files (e.g., `002_fix_profile_trigger.sql`), run them in order:

1. Open SQL Editor
2. Copy and paste each migration file
3. Run them sequentially

**Note:** Some migration files fix issues, so you might not need all of them. Check the migration comments.

---

## Troubleshooting

### "Table already exists" Error

If you see this error, the table might already exist. You can:
- Skip creating the table (comment out the CREATE TABLE line)
- Or drop the table first: `DROP TABLE IF EXISTS profiles CASCADE;`

### "Permission denied" Error

Make sure you're running the SQL as a superuser (which you are in the Supabase Dashboard).

### "Policy already exists" Error

If policies already exist, you can drop them first:
```sql
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
-- Then recreate it
```

---

## Quick SQL Commands to Verify Setup

Run these in SQL Editor to verify everything is set up:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'ai_tools');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'ai_tools');

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('profiles', 'ai_tools');
```

---

## After Running Migrations

1. ✅ Tables are created
2. ✅ RLS policies are set up
3. ✅ Triggers are configured
4. ✅ Ready to deploy to Vercel!

**Note:** You don't need to run migrations again after deploying to Vercel. The database is separate from your application deployment.

---

## Common Questions

**Q: Do I run migrations every time I deploy to Vercel?**
A: No. Migrations run once in Supabase. Your Vercel app connects to the same Supabase database.

**Q: Where are my migrations stored?**
A: They're in `supabase/migrations/` folder in your codebase. They're just SQL files - you manually run them in Supabase Dashboard.

**Q: Can I automate migrations?**
A: Yes, with Supabase CLI, but for now, running them manually in the Dashboard is fine.

**Q: What if I need to change the database schema later?**
A: Create a new migration file and run it in Supabase SQL Editor.

---

**Next Steps:** After running migrations, deploy to Vercel and your app will connect to the database!
