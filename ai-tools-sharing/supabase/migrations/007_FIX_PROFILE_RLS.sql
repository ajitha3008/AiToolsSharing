-- Fix RLS policies to ensure users can create their own profiles
-- This ensures the application code can create profiles after signup

-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow trigger to create profiles" ON profiles;

-- Create a policy that allows users to insert their own profile
-- This matches the RLS policy: auth.uid() = id
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also allow viewing all profiles (already exists, but ensure it's there)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Verify policies
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
WHERE tablename = 'profiles'
ORDER BY policyname;
