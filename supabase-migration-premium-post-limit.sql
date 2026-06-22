-- Add premium status to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;
