-- ============================================
-- Fond — Onboarding Data Migration
-- Run this in Supabase SQL Editor
-- ============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_onboarded      BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS relationship_status TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_goals    TEXT[],
  ADD COLUMN IF NOT EXISTS love_languages      TEXT[];
