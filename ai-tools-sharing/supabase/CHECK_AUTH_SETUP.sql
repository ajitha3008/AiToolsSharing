-- Check Supabase Auth configuration and troubleshoot signup issues
-- Run this in Supabase SQL Editor

-- 1. Check if email confirmation is required
-- Go to Dashboard → Authentication → Settings → Email Auth
-- Look for "Enable email confirmations" setting

-- 2. Check auth users table (you might not have direct access, but try)
SELECT COUNT(*) as total_users FROM auth.users;

-- 3. Check if there are any auth-related errors in logs
-- Go to Dashboard → Logs → Auth Logs

-- 4. Check profiles table
SELECT COUNT(*) as total_profiles FROM profiles;

-- 5. Check for any constraints that might block inserts
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- 6. Test inserting a profile manually (replace with actual UUID)
-- This will help identify if the issue is with RLS or constraints
-- INSERT INTO profiles (id, username, fullname) 
-- VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'test_user', 'Test User')
-- ON CONFLICT (id) DO NOTHING;

-- 7. Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 8. Verify the trigger exists
SELECT tgname, tgrelid::regclass, proname 
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
