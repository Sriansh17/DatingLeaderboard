-- ============================================
-- LoveBoard Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  city        TEXT,
  latitude    DOUBLE PRECISION,
  longitude   DOUBLE PRECISION,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Partners table
CREATE TABLE IF NOT EXISTS public.partners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  relationship    TEXT CHECK (relationship IN ('spouse', 'partner', 'boyfriend', 'girlfriend', 'other')),
  emoji           TEXT DEFAULT '💖',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Posts table (appreciation posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  partner_id      UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  description     TEXT NOT NULL,
  ai_score        SMALLINT CHECK (ai_score BETWEEN 1 AND 100),
  ai_feedback     TEXT,
  ai_explanation  TEXT,
  is_public       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leaderboard cache table (fallback when Redis is down)
CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_partner_id ON public.posts(partner_id);
CREATE INDEX IF NOT EXISTS idx_posts_ai_score ON public.posts(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON public.partners(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- ============================================
-- Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_partner_updated
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_post_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update only their own
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Partners: users can CRUD their own partners
CREATE POLICY "partners_select" ON public.partners
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "partners_insert" ON public.partners
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "partners_update" ON public.partners
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "partners_delete" ON public.partners
  FOR DELETE USING (user_id = auth.uid());

-- Posts: users can read public posts, CRUD their own
CREATE POLICY "posts_select" ON public.posts
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "posts_insert" ON public.posts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "posts_update" ON public.posts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "posts_delete" ON public.posts
  FOR DELETE USING (user_id = auth.uid());

-- Leaderboard cache: anyone can read
CREATE POLICY "leaderboard_select" ON public.leaderboard_cache
  FOR SELECT USING (true);
