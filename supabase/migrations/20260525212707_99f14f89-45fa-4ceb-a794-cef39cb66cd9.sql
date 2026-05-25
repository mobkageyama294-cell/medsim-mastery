
-- 1. user_progress
CREATE TABLE public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL DEFAULT 0,
  achievements TEXT[] NOT NULL DEFAULT '{}',
  total_cases INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  recent_scores INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own progress"
  ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress"
  ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress"
  ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Extra columns on case_history for achievement logic
ALTER TABLE public.case_history
  ADD COLUMN IF NOT EXISTS final_score INTEGER,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS specialty TEXT,
  ADD COLUMN IF NOT EXISTS humanitarian_score INTEGER,
  ADD COLUMN IF NOT EXISTS unnecessary_count INTEGER;
