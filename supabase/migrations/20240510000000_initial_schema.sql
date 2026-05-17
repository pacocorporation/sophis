-- Limpar tabelas existentes para garantir compatibilidade
DROP TABLE IF EXISTS public.logs;
DROP TABLE IF EXISTS public.flows;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.customers;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.leads;

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id),
    total_price DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flows table for Automation Engine
CREATE TABLE public.flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    definition JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs table
CREATE TABLE public.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT DEFAULT 'info',
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table (CRM)
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    status TEXT CHECK (status IN ('new', 'attending', 'negotiating', 'closed', 'lost')) DEFAULT 'new',
    tags TEXT[],
    last_message TEXT,
    ai_insight TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desativar RLS para facilitar o teste inicial
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.flows DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;


-- Insert initial products
INSERT INTO public.products (name, slug, price, quantity, category)
VALUES 
    ('Paracetamol', 'paracetamol', 12.50, 150, 'analgesico'),
    ('Dipirona', 'dipirona', 8.90, 200, 'analgesico'),
    ('Amoxicilina', 'amoxicilina', 45.00, 30, 'antibiotico'),
    ('Ibuprofeno', 'ibuprofeno', 18.00, 85, 'anti-inflamatorio'),
    ('Vitamina C', 'vitamina-c', 25.00, 120, 'suplemento')
ON CONFLICT (slug) DO NOTHING;

-- Insert initial leads
INSERT INTO public.leads (name, phone, email, status, tags, ai_insight)
VALUES 
    ('João Silva', '(11) 98888-7777', 'joao@email.com', 'new', ARRAY['VIP', 'Recorrente'], 'Interesse em Amoxicilina. Perfil recorrente.'),
    ('Maria Souza', '(21) 97777-6666', 'maria@email.com', 'attending', ARRAY['Antibiótico'], 'Enviou receita. Aguardando cotação.'),
    ('Carlos Oliveira', '(31) 96666-5555', 'carlos@email.com', 'negotiating', ARRAY['Hipertenso'], 'Busca alívio para dor. Orçamento alto.')
ON CONFLICT DO NOTHING;
