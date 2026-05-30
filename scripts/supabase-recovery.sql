-- Supabase Recovery Script
-- Safe to rerun: this script does not drop existing tables or data.
-- Run from Supabase Dashboard > SQL Editor after recreating the project.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  show_in_ranking BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.solo_game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  weather_id TEXT NOT NULL,
  mission_id TEXT,
  rounds_data JSONB NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.versus_game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  winner TEXT,
  player1_score INTEGER NOT NULL,
  player2_score INTEGER NOT NULL,
  rounds_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_in_ranking BOOLEAN DEFAULT TRUE;
ALTER TABLE public.solo_game_history ADD COLUMN IF NOT EXISTS mission_id TEXT;
ALTER TABLE public.solo_game_history ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solo_game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versus_game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own game history" ON public.solo_game_history;
DROP POLICY IF EXISTS "Users can insert own game history" ON public.solo_game_history;
DROP POLICY IF EXISTS "Users can view own versus history" ON public.versus_game_history;
DROP POLICY IF EXISTS "Users can insert own versus history" ON public.versus_game_history;
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON public.user_achievements;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own game history"
  ON public.solo_game_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game history"
  ON public.solo_game_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own versus history"
  ON public.versus_game_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own versus history"
  ON public.versus_game_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON public.user_achievements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_solo_game_history_user_id ON public.solo_game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_solo_game_history_total_score ON public.solo_game_history(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_solo_game_history_created_at ON public.solo_game_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_versus_game_history_user_id ON public.versus_game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_versus_game_history_created_at ON public.versus_game_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.show_in_ranking,
  MAX(sgh.total_score) AS best_score,
  COUNT(sgh.id) AS total_games,
  SUM(CASE WHEN sgh.completed THEN 1 ELSE 0 END) AS completed_games
FROM public.profiles p
LEFT JOIN public.solo_game_history sgh ON p.id = sgh.user_id
WHERE p.show_in_ranking = TRUE
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.show_in_ranking
HAVING MAX(sgh.total_score) IS NOT NULL
ORDER BY best_score DESC;

GRANT SELECT ON public.leaderboard TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.solo_game_history TO authenticated;
GRANT SELECT, INSERT ON public.versus_game_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_achievements TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, show_in_ranking)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON VIEW public.leaderboard IS 'Solo mode ranking view sorted by best score.';
