-- Daily Engagement System — Streaks, Badges, Perks
-- Run this in Supabase SQL Editor

-- 1. Streak tracking on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_count      INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak    INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_post_date    DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges            JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_perks      JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS collected_perk_ids TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_perk_date    DATE;
