-- Atomic increment functions for race-condition-free counting
-- Run via: supabase migration up or copy-paste into Supabase SQL Editor

-- 1. Atomic views counter — returns new count
CREATE OR REPLACE FUNCTION increment_views(post_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE posts
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = post_id
  RETURNING views_count INTO new_count;

  RETURN new_count;
END;
$$;

-- 2. Atomic comment vote increment — returns new vote count
CREATE OR REPLACE FUNCTION increment_comment_votes(comment_id UUID, delta INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_votes INTEGER;
BEGIN
  UPDATE comments
  SET votes = GREATEST(0, COALESCE(votes, 0) + delta)
  WHERE id = comment_id
  RETURNING votes INTO new_votes;

  RETURN new_votes;
END;
$$;
