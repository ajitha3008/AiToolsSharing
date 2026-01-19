# Fix "Database error saving new user" Issue

## Step-by-Step Solution

### Step 1: Temporarily Disable the Trigger

The trigger might be causing the user creation to fail. Let's disable it first:

1. Go to **Supabase Dashboard → SQL Editor**
2. Run this SQL:

```sql
-- Disable the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

3. Try signing up again. If it works, the trigger is the problem.

### Step 2: Check Email Confirmation Settings

1. Go to **Supabase Dashboard → Authentication → Settings**
2. Scroll to **"Email Auth"** section
3. **Disable "Enable email confirmations"** temporarily for testing
4. Save the settings
5. Try signing up again

### Step 3: Check Auth Logs

1. Go to **Supabase Dashboard → Logs → Auth Logs**
2. Look for errors related to your signup attempts
3. Check the error messages - they'll tell you exactly what's wrong

### Step 4: Test with a Simple Signup

Try signing up with:
- A simple email (e.g., `test@example.com`)
- A password with at least 6 characters
- No username field

### Step 5: Re-enable Trigger (After Signup Works)

Once signup works without the trigger, we can fix the trigger:

```sql
-- Recreate the trigger with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip if profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;
  
  -- Insert profile with safe defaults
  INSERT INTO profiles (id, username, fullname)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'username', ''),
      'user_' || substr(NEW.id::TEXT, 1, 8)
    ),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'fullname', ''), NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail user creation if profile creation fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Most Likely Causes

1. **Trigger failing** - The trigger function is throwing an error that rolls back the entire transaction
2. **Email confirmation** - If email sending fails, user creation might fail
3. **RLS policies** - Though unlikely since triggers use SECURITY DEFINER
4. **Database constraints** - Check for any constraints on auth.users table

## Quick Test Script

Run this to test if you can create a user manually (requires service role key):

```sql
-- This won't work directly, but shows what Supabase does internally
-- The actual user creation happens in Supabase's auth service
```

## Alternative: Create Profile After Email Confirmation

If the trigger keeps failing, we can create profiles when users confirm their email using a webhook or when they first sign in.
