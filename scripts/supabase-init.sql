-- Supabase Schema Initialization Script
-- This script sets up all tables, RLS policies, indexes, and views
-- Execute this in Supabase SQL Editor in the following order:
-- 1. Create extension
-- 2. Create tables
-- 3. Enable RLS and create policies
-- 4. Create indexes
-- 5. Create views
-- 6. Apply ranking migration

-- ======================================
-- Step 1: Enable Required Extensions
-- ======================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================
-- Step 2: Create Tables
-- ======================================

-- Drop existing tables to ensure clean state (with CASCADE to handle foreign keys)
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS versus_game_history CASCADE;
DROP TABLE IF EXISTS solo_game_history CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2.1 Profiles Table (User Profile Information)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  show_in_ranking BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Solo Game History Table
CREATE TABLE solo_game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  weather_id TEXT NOT NULL,
  mission_id TEXT,
  rounds_data JSONB NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 Versus Game History Table (Local Battle)
CREATE TABLE versus_game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  winner TEXT,
  player1_score INTEGER NOT NULL,
  player2_score INTEGER NOT NULL,
  rounds_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 User Achievements Table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ======================================
-- Step 3: Enable RLS (Row Level Security)
-- ======================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solo_game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE versus_game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ======================================
-- Step 4: Create RLS Policies
-- ======================================

-- 4.1 Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow profile creation (insert)
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4.2 Solo Game History Policies
DROP POLICY IF EXISTS "Users can view own game history" ON solo_game_history;
DROP POLICY IF EXISTS "Users can insert own game history" ON solo_game_history;

CREATE POLICY "Users can view own game history"
  ON solo_game_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game history"
  ON solo_game_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4.3 Versus Game History Policies
DROP POLICY IF EXISTS "Users can view own versus history" ON versus_game_history;
DROP POLICY IF EXISTS "Users can insert own versus history" ON versus_game_history;

CREATE POLICY "Users can view own versus history"
  ON versus_game_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own versus history"
  ON versus_game_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4.4 User Achievements Policies
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON user_achievements;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON user_achievements FOR ALL
  USING (auth.uid() = user_id);

-- ======================================
-- Step 5: Create Indexes
-- ======================================

CREATE INDEX IF NOT EXISTS idx_solo_game_history_user_id ON solo_game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_solo_game_history_total_score ON solo_game_history(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_solo_game_history_created_at ON solo_game_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_versus_game_history_user_id ON versus_game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_versus_game_history_created_at ON versus_game_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- ======================================
-- Step 6: Create Views
-- ======================================

-- 6.1 Leaderboard View (Ranking)
DROP VIEW IF EXISTS leaderboard CASCADE;

CREATE VIEW leaderboard AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.show_in_ranking,
  MAX(sgh.total_score) as best_score,
  COUNT(sgh.id) as total_games,
  SUM(CASE WHEN sgh.completed THEN 1 ELSE 0 END) as completed_games
FROM profiles p
LEFT JOIN solo_game_history sgh ON p.id = sgh.user_id
WHERE p.show_in_ranking = true
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.show_in_ranking
HAVING MAX(sgh.total_score) IS NOT NULL
ORDER BY best_score DESC;

-- Add comment
COMMENT ON VIEW leaderboard IS 'Solo mode ranking view (sorted by best score)';

-- ======================================
-- Step 7: Verification Queries
-- ======================================

-- Verify profiles table
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles' ORDER BY ordinal_position;

-- Verify solo_game_history table
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'solo_game_history' ORDER BY ordinal_position;

-- Verify leaderboard view
-- SELECT * FROM leaderboard LIMIT 10;

-- ======================================
-- Notes
-- ======================================
-- - pgcrypto extension enables gen_random_uuid()
-- - RLS is enabled on all tables for security
-- - Indexes optimize query performance
-- - Views provide convenient data aggregation
-- - All timestamps use UTC (TIMESTAMP WITH TIME ZONE)
