
-- Fix user_id column type from smallint to UUID
ALTER TABLE public.team_members DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.team_members ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
