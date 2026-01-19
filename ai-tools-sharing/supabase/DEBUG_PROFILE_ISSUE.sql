-- Debug script to check profile creation issues
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check if trigger exists
SELECT 
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- 2. Check the function definition
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Check RLS policies on profiles
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
WHERE tablename = 'profiles';

-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. Test the function manually (replace USER_ID with an actual user ID)
-- SELECT handle_new_user() FROM auth.users WHERE id = 'USER_ID_HERE';

-- 6. Check recent users without profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END AS profile_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 7. Check for username conflicts
SELECT username, COUNT(*) as count
FROM profiles
GROUP BY username
HAVING COUNT(*) > 1;

-- 8. Check table constraints
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;
