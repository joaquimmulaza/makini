-- MAKINI SUPABASE SCHEMA

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('agricultor', 'fornecedor');
CREATE TYPE listing_type AS ENUM ('equipamento', 'transporte', 'servico');
CREATE TYPE listing_status AS ENUM ('imediata', 'amanha', 'indisponivel');

-- 2. Create Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    role user_role NOT NULL,
    nome_completo TEXT NOT NULL,
    telefone TEXT,
    nif TEXT,
    documento_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Listings Table
CREATE TABLE public.listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fornecedor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tipo listing_type NOT NULL,
    categoria TEXT NOT NULL,
    titulo TEXT NOT NULL,
    capacidade_especificacao TEXT NOT NULL,
    nome_empresa TEXT NOT NULL,
    preco NUMERIC NOT NULL,
    unidade_preco TEXT DEFAULT 'kz',
    disponibilidade listing_status DEFAULT 'imediata',
    localizacao TEXT NOT NULL,
    imagem_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Profiles
-- Users can view all verified suppliers (for the sake of the app)
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING ( true );

-- Users can insert their own profile.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- Users can update own profile.
CREATE POLICY "Users can update own profile."
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- 6. RLS Policies for Listings
-- Everyone can view listings
CREATE POLICY "Listings are viewable by everyone."
ON public.listings FOR SELECT
USING ( true );

-- Only authenticated suppliers can insert listings
CREATE POLICY "Suppliers can insert listings."
ON public.listings FOR INSERT
WITH CHECK ( 
  auth.uid() = fornecedor_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'fornecedor')
);

-- 7. Automated Trigger for Supplier Verification
-- When NIF and documento_url are present, automatically verify the supplier profile.
CREATE OR REPLACE FUNCTION verify_supplier_automatically()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'fornecedor' AND NEW.nif IS NOT NULL AND NEW.nif != '' AND NEW.documento_url IS NOT NULL AND NEW.documento_url != '' THEN
        NEW.is_verified = true;
    ELSIF NEW.role = 'agricultor' THEN
        -- Farmers don't need doc/nif for initial verification, simulating email verification is done in auth flow
        NEW.is_verified = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_verify_supplier
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION verify_supplier_automatically();

-- 8. Storage Logic placeholder (Requires executing in Supabase Dashboard)
-- insert into storage.buckets (id, name, public) values ('makini-images', 'makini-images', true);
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'makini-images' );
-- create policy "Authenticated Uploads" on storage.objects for insert with check ( auth.role() = 'authenticated' and bucket_id = 'makini-images' );
