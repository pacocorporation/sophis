-- Migration to create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL,
    sent INTEGER DEFAULT 0,
    converted INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for testing
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;

-- Add triggers for updated_at if they exist in other tables
-- (Optional, but good practice)
