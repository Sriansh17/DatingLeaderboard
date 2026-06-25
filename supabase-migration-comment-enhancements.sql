-- Add votes, reactions, and parent_id to comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS votes integer DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reactions jsonb DEFAULT '{}'::jsonb;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES comments(id) ON DELETE CASCADE;
