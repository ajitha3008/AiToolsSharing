# Supabase Database Setup

This directory contains SQL migration files for setting up the AI Tools Sharing platform database.

## Database Schema Overview

The schema includes the following tables:

1. **profiles** - User profiles extending Supabase Auth (id, username, fullname, created_at, updated_at)
2. **ai_tools** - AI tools submitted by users (user_id, tool_name, use_case, rating, hashtags, date_uploaded)

## How to Run Migrations in Supabase

### Option 1: Using Supabase Dashboard (Recommended for first setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `001_initial_schema.sql`
5. Click **Run** (or press `Ctrl/Cmd + Enter`)
6. Verify the tables were created by checking **Table Editor** in the sidebar

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## Features Included

### Row Level Security (RLS)
All tables have RLS enabled with policies for:
- Public read access where appropriate
- User-owned data modifications

### Automatic Triggers
- **updated_at** timestamps are automatically updated on profile modifications
- **Profile creation** is automatic when a new user signs up

### Indexes
Optimized indexes for:
- User lookups
- Date sorting (latest first)
- Rating sorting
- Hashtag filtering
- Tool name search

## Post-Migration Steps

### 1. Verify Tables
Check that all tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. Verify RLS Policies
Check that RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 3. Test Profile Creation
After a user signs up, verify the profile was automatically created:
```sql
SELECT * FROM profiles;
```

### 4. Storage Setup (Optional)
If you plan to store images/attachments:

1. Go to **Storage** in Supabase dashboard
2. Create a bucket named `attachments` or `avatars`
3. Set up policies for authenticated users to upload/view

Example storage policies:
```sql
-- Allow authenticated users to upload to attachments bucket
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Allow public read access to attachments
CREATE POLICY "Public can view attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attachments');
```

## Important Notes

- The `profiles` table extends Supabase Auth and automatically creates a profile when a user signs up
- The `rating` field in `ai_tools` is constrained to values between 1 and 5
- Hashtags are stored as PostgreSQL arrays (`TEXT[]`)
- All timestamps use `TIMESTAMPTZ` for timezone support

## Next Steps

After running the migration:
1. Set up Supabase client in your Next.js app
2. Configure environment variables
3. Implement authentication flow
4. Build API routes for CRUD operations
