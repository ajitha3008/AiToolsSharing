-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE (extends Supabase Auth)
-- ============================================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  fullname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- AI TOOLS TABLE
-- ============================================================================
CREATE TABLE ai_tools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_name TEXT NOT NULL,
  use_case TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  hashtags TEXT[] DEFAULT '{}',
  date_uploaded TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on ai_tools
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- AI Tools policies
CREATE POLICY "AI tools are viewable by everyone"
  ON ai_tools FOR SELECT
  USING (true);

CREATE POLICY "Users can create AI tools"
  ON ai_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI tools"
  ON ai_tools FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI tools"
  ON ai_tools FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_ai_tools_user_id ON ai_tools(user_id);
CREATE INDEX idx_ai_tools_date_uploaded ON ai_tools(date_uploaded DESC);
CREATE INDEX idx_ai_tools_rating ON ai_tools(rating DESC);
CREATE INDEX idx_ai_tools_hashtags ON ai_tools USING gin(hashtags);
CREATE INDEX idx_ai_tools_tool_name ON ai_tools(tool_name);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, fullname)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'fullname', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
