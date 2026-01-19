-- FIXED VERSION: Recreate the trigger with proper error handling
-- Only run this AFTER signup works without the trigger
-- This version won't cause signup to fail even if profile creation fails

-- Drop any existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a safe trigger function that won't fail user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use a separate transaction context to prevent rollback
  -- This ensures user creation succeeds even if profile creation fails
  
  BEGIN
    -- Skip if profile already exists
    IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
      RETURN NEW;
    END IF;
    
    -- Generate a safe username
    DECLARE
      base_username TEXT;
      final_username TEXT;
    BEGIN
      base_username := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'username', ''),
        split_part(NEW.email, '@', 1),
        'user_' || substr(NEW.id::TEXT, 1, 8)
      );
      
      -- Clean username
      base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g');
      base_username := left(COALESCE(base_username, ''), 30);
      
      IF base_username = '' THEN
        base_username := 'user_' || substr(NEW.id::TEXT, 1, 8);
      END IF;
      
      final_username := base_username;
      
      -- Handle duplicates by appending number
      WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
        final_username := base_username || floor(random() * 1000)::TEXT;
        -- Safety break
        IF length(final_username) > 40 THEN
          final_username := 'user_' || substr(NEW.id::TEXT, 1, 8);
          EXIT;
        END IF;
      END LOOP;
      
      -- Insert profile
      INSERT INTO profiles (id, username, fullname)
      VALUES (
        NEW.id,
        final_username,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'fullname', ''), NULL)
      )
      ON CONFLICT (id) DO NOTHING;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- If username insert fails, try with UUID-based username
        BEGIN
          INSERT INTO profiles (id, username, fullname)
          VALUES (
            NEW.id,
            'user_' || substr(NEW.id::TEXT, 1, 8),
            NULL
          )
          ON CONFLICT (id) DO NOTHING;
        EXCEPTION
          WHEN OTHERS THEN
            -- Silent fail - don't prevent user creation
            NULL;
        END;
    END;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log but don't fail - user creation must succeed
      RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Verify it's created
SELECT 
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
