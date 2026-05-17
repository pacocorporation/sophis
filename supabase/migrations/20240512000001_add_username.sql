
-- Add username column to team_members
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Update status check constraint if necessary (optional, since we'll use 'role' for the new levels)
-- For now, let's just make sure we have the column.
