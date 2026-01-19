-- Complete fix for profile creation trigger
-- This version handles all edge cases and RLS properly

-- First, drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a more robust function that handles all cases
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile already exists (shouldn't happen, but be safe)
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = NEW.id) INTO profile_exists;
  
  IF profile_exists THEN
    RETURN NEW; -- Profile already exists, nothing to do
  END IF;
  
  -- Get base username from metadata or email
  base_username := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'username', ''),
    split_part(NEW.email, '@', 1)
  );
  
  -- Ensure username is not empty
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'user_' || substr(NEW.id::TEXT, 1, 8);
  END IF;
  
  -- Clean username (remove special characters, limit length)
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g');
  base_username := left(base_username, 30); -- Limit to 30 chars
  
  final_username := base_username;
  
  -- Check if username already exists, if so append a number
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
    
    -- Safety check to prevent infinite loop
    IF counter > 1000 THEN
      final_username := 'user_' || substr(NEW.id::TEXT, 1, 8);
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert profile with unique username
  -- Using SECURITY DEFINER to bypass RLS
  INSERT INTO profiles (id, username, fullname)
  VALUES (
    NEW.id, 
    final_username,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'fullname', ''), NULL)
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username conflict still occurs, use UUID-based username
    BEGIN
      INSERT INTO profiles (id, username, fullname)
      VALUES (
        NEW.id,
        'user_' || substr(NEW.id::TEXT, 1, 8),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'fullname', ''), NULL)
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Last resort: just use the user ID as username
        INSERT INTO profiles (id, username, fullname)
        VALUES (NEW.id, NEW.id::TEXT, NULL);
    END;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    -- The user will be created, but profile creation failed
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions (if needed)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
