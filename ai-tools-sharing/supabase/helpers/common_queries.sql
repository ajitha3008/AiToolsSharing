-- ============================================================================
-- COMMON QUERIES FOR AI TOOLS SHARING PLATFORM
-- ============================================================================
-- This file contains useful queries for testing, management, and development

-- ============================================================================
-- QUERY EXAMPLES
-- ============================================================================

-- Get all AI tools with user information
SELECT 
  at.id,
  at.tool_name,
  at.use_case,
  at.rating,
  at.hashtags,
  at.date_uploaded,
  p.username,
  p.fullname
FROM ai_tools at
JOIN profiles p ON at.user_id = p.id
ORDER BY at.date_uploaded DESC;

-- Get AI tools by user
SELECT 
  at.id,
  at.tool_name,
  at.use_case,
  at.rating,
  at.hashtags,
  at.date_uploaded
FROM ai_tools at
WHERE at.user_id = 'user-id-here'
ORDER BY at.date_uploaded DESC;

-- Get AI tools by rating (highest first)
SELECT 
  at.id,
  at.tool_name,
  at.use_case,
  at.rating,
  at.hashtags,
  at.date_uploaded,
  p.username,
  p.fullname
FROM ai_tools at
JOIN profiles p ON at.user_id = p.id
WHERE at.rating IS NOT NULL
ORDER BY at.rating DESC, at.date_uploaded DESC;

-- Get AI tools by hashtag
SELECT 
  at.id,
  at.tool_name,
  at.use_case,
  at.rating,
  at.hashtags,
  at.date_uploaded,
  p.username,
  p.fullname
FROM ai_tools at
JOIN profiles p ON at.user_id = p.id
WHERE 'productivity' = ANY(at.hashtags)
ORDER BY at.date_uploaded DESC;

-- Search AI tools by tool name
SELECT 
  at.id,
  at.tool_name,
  at.use_case,
  at.rating,
  at.hashtags,
  at.date_uploaded,
  p.username,
  p.fullname
FROM ai_tools at
JOIN profiles p ON at.user_id = p.id
WHERE LOWER(at.tool_name) LIKE LOWER('%search term%')
ORDER BY at.date_uploaded DESC;

-- Search AI tools by use case
SELECT 
  at.id,
  at.tool_name,
  at.use_case,
  at.rating,
  at.hashtags,
  at.date_uploaded,
  p.username,
  p.fullname
FROM ai_tools at
JOIN profiles p ON at.user_id = p.id
WHERE LOWER(at.use_case) LIKE LOWER('%search term%')
ORDER BY at.date_uploaded DESC;

-- Get latest AI tools (most recent first)
SELECT 
  at.id,
  at.tool_name,
  at.use_case,
  at.rating,
  at.hashtags,
  at.date_uploaded,
  p.username,
  p.fullname
FROM ai_tools at
JOIN profiles p ON at.user_id = p.id
ORDER BY at.date_uploaded DESC
LIMIT 20;

-- Get profile with their AI tools count
SELECT 
  p.id,
  p.username,
  p.fullname,
  p.created_at,
  COUNT(at.id) AS tools_count,
  AVG(at.rating) AS avg_rating
FROM profiles p
LEFT JOIN ai_tools at ON p.id = at.user_id
GROUP BY p.id, p.username, p.fullname, p.created_at
ORDER BY tools_count DESC;

-- Get top rated AI tools (with at least 1 rating)
SELECT 
  at.id,
  at.tool_name,
  at.use_case,
  at.rating,
  at.hashtags,
  at.date_uploaded,
  p.username,
  p.fullname
FROM ai_tools at
JOIN profiles p ON at.user_id = p.id
WHERE at.rating IS NOT NULL
ORDER BY at.rating DESC, at.date_uploaded DESC
LIMIT 20;

-- Get all unique hashtags with count
SELECT 
  hashtag,
  COUNT(*) AS usage_count
FROM ai_tools,
  UNNEST(hashtags) AS hashtag
GROUP BY hashtag
ORDER BY usage_count DESC;

-- Get tools by multiple hashtags
SELECT 
  at.id,
  at.tool_name,
  at.use_case,
  at.rating,
  at.hashtags,
  at.date_uploaded,
  p.username,
  p.fullname
FROM ai_tools at
JOIN profiles p ON at.user_id = p.id
WHERE at.hashtags && ARRAY['productivity', 'automation']::TEXT[]
ORDER BY at.date_uploaded DESC;

-- ============================================================================
-- STATISTICS QUERIES
-- ============================================================================

-- Get platform stats
SELECT 
  (SELECT COUNT(*) FROM profiles) AS total_users,
  (SELECT COUNT(*) FROM ai_tools) AS total_tools,
  (SELECT COUNT(*) FROM ai_tools WHERE rating IS NOT NULL) AS tools_with_ratings,
  (SELECT AVG(rating) FROM ai_tools WHERE rating IS NOT NULL) AS avg_rating;

-- Get tools uploaded in last 7 days
SELECT 
  DATE(date_uploaded) AS date,
  COUNT(*) AS tools_count
FROM ai_tools
WHERE date_uploaded >= NOW() - INTERVAL '7 days'
GROUP BY DATE(date_uploaded)
ORDER BY date DESC;

-- Get tools by rating distribution
SELECT 
  rating,
  COUNT(*) AS count
FROM ai_tools
WHERE rating IS NOT NULL
GROUP BY rating
ORDER BY rating DESC;

-- ============================================================================
-- USER-SPECIFIC QUERIES (requires auth.uid())
-- ============================================================================

-- Get current user's profile
SELECT * FROM profiles WHERE id = auth.uid();

-- Get current user's AI tools
SELECT 
  at.*,
  p.username,
  p.fullname
FROM ai_tools at
JOIN profiles p ON at.user_id = p.id
WHERE at.user_id = auth.uid()
ORDER BY at.date_uploaded DESC;

-- ============================================================================
-- MAINTENANCE QUERIES (Use with caution!)
-- ============================================================================

-- Count tools per user
SELECT 
  p.username,
  p.fullname,
  COUNT(at.id) AS tools_count
FROM profiles p
LEFT JOIN ai_tools at ON p.id = at.user_id
GROUP BY p.id, p.username, p.fullname
ORDER BY tools_count DESC;
