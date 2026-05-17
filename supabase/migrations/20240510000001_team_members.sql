-- Team Members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Admin', 'Membro')),
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for consistency with other tables in this project
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- Insert initial team members
INSERT INTO public.team_members (name, role, email, status)
VALUES 
    ('Geovani Allan', 'Supervisor', 'geovaniallanmax@gmail.com', 'Admin'),
    ('Socorro', 'Gerente', 'socorro@drogaria.com', 'Membro'),
    ('Maura', 'Atendimento', 'maura@drogaria.com', 'Membro'),
    ('Lucineide', 'Atendimento', 'lucineide@drogaria.com', 'Membro')
ON CONFLICT (email) DO NOTHING;
