-- ============================================
-- Anonymous Confessions — Full Schema
-- Run this in Supabase SQL Editor
-- Idempotent: safe to re-run
-- ============================================

-- 1. Confessions table
CREATE TABLE IF NOT EXISTS public.confessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content         TEXT NOT NULL,
  is_approved     BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_confessions_created_at ON public.confessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confessions_user_id ON public.confessions(user_id);

CREATE OR REPLACE TRIGGER on_confession_updated
  BEFORE UPDATE ON public.confessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confessions' AND policyname = 'confessions_select') THEN
    CREATE POLICY "confessions_select" ON public.confessions FOR SELECT USING (is_approved = true OR user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confessions' AND policyname = 'confessions_insert') THEN
    CREATE POLICY "confessions_insert" ON public.confessions FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confessions' AND policyname = 'confessions_update') THEN
    CREATE POLICY "confessions_update" ON public.confessions FOR UPDATE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confessions' AND policyname = 'confessions_delete') THEN
    CREATE POLICY "confessions_delete" ON public.confessions FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- 2. Confession Reactions (👀 🔥 😭 💀 🫶 — one per user per confession)
CREATE TABLE IF NOT EXISTS public.confession_reactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id   UUID REFERENCES public.confessions(id) ON DELETE CASCADE NOT NULL,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction        TEXT NOT NULL CHECK (reaction IN ('peek', 'spicy', 'relatable', 'dead', 'wholesome')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(confession_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_confession_reactions_confession_id ON public.confession_reactions(confession_id);

ALTER TABLE public.confession_reactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confession_reactions' AND policyname = 'cr_select') THEN
    CREATE POLICY "cr_select" ON public.confession_reactions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confession_reactions' AND policyname = 'cr_insert') THEN
    CREATE POLICY "cr_insert" ON public.confession_reactions FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confession_reactions' AND policyname = 'cr_delete') THEN
    CREATE POLICY "cr_delete" ON public.confession_reactions FOR DELETE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confession_reactions' AND policyname = 'cr_update') THEN
    CREATE POLICY "cr_update" ON public.confession_reactions FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- 3. Confession Replies (anonymous threaded comments)
CREATE TABLE IF NOT EXISTS public.confession_replies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id   UUID REFERENCES public.confessions(id) ON DELETE CASCADE NOT NULL,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_confession_replies_confession_id ON public.confession_replies(confession_id);
CREATE INDEX IF NOT EXISTS idx_confession_replies_created_at ON public.confession_replies(confession_id, created_at ASC);

CREATE OR REPLACE TRIGGER on_confession_reply_updated
  BEFORE UPDATE ON public.confession_replies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.confession_replies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confession_replies' AND policyname = 'creplies_select') THEN
    CREATE POLICY "creplies_select" ON public.confession_replies FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confession_replies' AND policyname = 'creplies_insert') THEN
    CREATE POLICY "creplies_insert" ON public.confession_replies FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'confession_replies' AND policyname = 'creplies_delete') THEN
    CREATE POLICY "creplies_delete" ON public.confession_replies FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;
