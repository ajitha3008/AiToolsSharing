-- TEMPORARY FIX: Disable the trigger that's causing signup to fail
-- Run this immediately to fix the "Database error saving new user" issue

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Verify it's gone
SELECT 
  tgname AS trigger_name,
  tgrelid::regclass AS table_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- If the query above returns no rows, the trigger is successfully disabled
-- Now try signing up again - it should work!
