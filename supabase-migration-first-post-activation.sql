-- First-post activation gate
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- Backfill activation for existing users who already have at least one post.
WITH first_posts AS (
  SELECT user_id, MIN(created_at) AS first_post_at
  FROM public.posts
  GROUP BY user_id
)
UPDATE public.profiles p
SET activated_at = fp.first_post_at
FROM first_posts fp
WHERE p.id = fp.user_id
  AND p.activated_at IS NULL;
