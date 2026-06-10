-- Backfill post_city for all existing posts that don't have one yet.
-- Assigns a random Indian city so old posts don't all share the same profile city.
-- Run this in your Supabase SQL Editor.

UPDATE public.posts
SET post_city = CASE
  WHEN floor(random() * 4) = 0 THEN 'Delhi'
  WHEN floor(random() * 4) = 1 THEN 'Mumbai'
  WHEN floor(random() * 4) = 2 THEN 'Bangalore'
  ELSE 'Chandigarh'
END
WHERE post_city IS NULL;
