-- Add trigram index for ILIKE search on profiles (username, full_name)
-- Requires: CREATE EXTENSION IF NOT EXISTS pg_trgm (enabled below)

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_profiles_username_gin
  ON profiles USING gin (username gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_full_name_gin
  ON profiles USING gin (full_name gin_trgm_ops);
