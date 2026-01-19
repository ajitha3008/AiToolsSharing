-- Fix the handle_new_user function to handle duplicate usernames gracefully
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Get base username from metadata or email
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  final_username := base_username;
  
  -- Check if username already exists, if so append a number
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  -- Insert profile with unique username
  INSERT INTO profiles (id, username, fullname)
  VALUES (
    NEW.id, 
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'fullname', NULL)
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
