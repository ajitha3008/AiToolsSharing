# Troubleshooting Supabase Setup

## Common Issues and Solutions

### 1. "Database error saving new user" during sign up

This error typically occurs when the profile creation trigger fails. Here are the steps to fix it:

#### Solution A: Run the updated trigger migration

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration file: `supabase/migrations/002_fix_profile_trigger.sql`
3. This will update the trigger to handle duplicate usernames gracefully

#### Solution B: Check if trigger exists

Run this query in Supabase SQL Editor to check if the trigger is set up:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

If it doesn't exist, run the original migration: `001_initial_schema.sql`

#### Solution C: Manual profile creation (temporary workaround)

If the trigger still fails, you can manually create profiles:

1. Sign up a user
2. Go to Supabase Dashboard → Authentication → Users
3. Copy the user's ID
4. Go to Table Editor → profiles
5. Insert a new row with:
   - `id`: The user ID from step 3
   - `username`: Any unique username
   - `fullname`: (optional)

### 2. Username already exists error

The updated trigger (`002_fix_profile_trigger.sql`) automatically handles this by appending numbers to duplicate usernames.

### 3. RLS Policy blocking profile creation

If profiles aren't being created, check RLS policies:

```sql
-- Check RLS policies on profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

The trigger function uses `SECURITY DEFINER`, which should bypass RLS, but if issues persist:

```sql
-- Temporarily disable RLS to test (NOT recommended for production)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

### 4. Testing the trigger manually

You can test if the trigger works by checking:

```sql
-- Check recent users
SELECT id, email, raw_user_meta_data FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Check if profiles exist for those users
SELECT p.* FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC LIMIT 5;
```

### 5. Disable email confirmation (for testing)

If you want to test without email verification:

1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email Auth", toggle off "Enable email confirmations"
3. Users will be able to sign in immediately after sign up

### 6. Check trigger function logs

If the trigger is failing silently, check Supabase logs:

1. Go to Supabase Dashboard → Logs → Postgres Logs
2. Look for warnings or errors related to `handle_new_user`

## Quick Fix Script

Run this in Supabase SQL Editor to fix common issues:

```sql
-- Drop and recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  final_username := base_username;
  
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  INSERT INTO profiles (id, username, fullname)
  VALUES (
    NEW.id, 
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'fullname', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```
