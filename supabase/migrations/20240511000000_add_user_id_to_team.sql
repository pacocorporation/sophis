-- Add user_id column to team_members to link with auth.users
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
