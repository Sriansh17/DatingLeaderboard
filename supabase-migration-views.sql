-- Add views_count to posts table
ALTER TABLE IF EXISTS public.posts
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
