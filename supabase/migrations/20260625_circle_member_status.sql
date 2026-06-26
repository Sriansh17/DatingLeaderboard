-- Add status column to circle_members for invite → accept flow
-- 'active' = full member, 'invited' = pending acceptance

ALTER TABLE circle_members ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited'));

CREATE INDEX IF NOT EXISTS idx_circle_members_status ON circle_members(status);
