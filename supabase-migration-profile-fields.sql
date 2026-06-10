-- Add missing profile fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Add post_city column if not already present
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS post_city TEXT;

-- Backfill post_city from the user's current profile city for all existing posts
-- This ensures old posts keep their city even when profile city changes
UPDATE public.posts p
SET post_city = pr.city
FROM public.profiles pr
WHERE p.user_id = pr.id
  AND p.post_city IS NULL
  AND pr.city IS NOT NULL;
