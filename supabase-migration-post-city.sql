-- Run this in your Supabase SQL Editor to add the post_city column
-- This freezes the city at post creation time so old posts don't change
-- when a user updates their profile city.

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS post_city TEXT;
