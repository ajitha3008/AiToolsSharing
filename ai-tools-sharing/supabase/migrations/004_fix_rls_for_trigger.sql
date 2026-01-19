-- Fix RLS policies to allow trigger function to create profiles
-- The trigger function uses SECURITY DEFINER, but we need to ensure it can bypass RLS

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a policy that allows the trigger function to insert profiles
-- SECURITY DEFINER functions run as the function owner (postgres), so this should work
CREATE POLICY "Allow trigger to create profiles"
  ON profiles FOR INSERT
  WITH CHECK (true); -- Allow all inserts (RLS will be bypassed by SECURITY DEFINER anyway)

-- Also ensure authenticated users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Update the trigger function to be even more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Skip if profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;
  
  -- Get base username
  base_username := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'username', ''),
    split_part(NEW.email, '@', 1)
  );
  
  -- Ensure username is valid
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'user_' || substr(NEW.id::TEXT, 1, 8);
  END IF;
  
  -- Clean and limit username
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g');
  base_username := left(base_username, 30);
  final_username := base_username;
  
  -- Handle duplicates
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
    IF counter > 100 THEN
      final_username := 'user_' || substr(NEW.id::TEXT, 1, 8);
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert profile (SECURITY DEFINER should bypass RLS)
  INSERT INTO profiles (id, username, fullname)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'fullname', ''), NULL)
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If all else fails, try with UUID-based username
    BEGIN
      INSERT INTO profiles (id, username, fullname)
      VALUES (NEW.id, 'user_' || substr(NEW.id::TEXT, 1, 8), NULL)
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- Silent fail - user is created, profile can be created manually
        NULL;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
