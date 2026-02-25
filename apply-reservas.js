import pg from 'pg';

const { Client } = pg;

const client = new Client({
    connectionString: 'postgresql://postgres:angolamakini2026@db.lrfmxjdxyjlwzsfeixut.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

const schema = `
CREATE TYPE reserva_status AS ENUM ('pendente', 'aprovada', 'rejeitada', 'concluida');

CREATE TABLE IF NOT EXISTS public.reservas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agricultor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    fornecedor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    mensagem_contexto TEXT,
    status reserva_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- 1. Farmers can insert their own reservations
CREATE POLICY "Farmers can insert reservations."
ON public.reservas FOR INSERT
WITH CHECK ( auth.uid() = agricultor_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'agricultor') );

-- 2. Framers can see their reservations
CREATE POLICY "Farmers can view their reservations"
ON public.reservas FOR SELECT
USING ( auth.uid() = agricultor_id );

-- 3. Suppliers can view reservations directed to them
CREATE POLICY "Suppliers can view incoming reservations"
ON public.reservas FOR SELECT
USING ( auth.uid() = fornecedor_id );

-- 4. Suppliers can update the status of reservations directed to them
CREATE POLICY "Suppliers can update reservation status"
ON public.reservas FOR UPDATE
USING ( auth.uid() = fornecedor_id );
`;

async function applyReservas() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        console.log('Applying Reservas Schema...');
        await client.query(schema);

        console.log('Reservas Schema applied successfully!');
    } catch (error) {
        console.error('Error applying schema:', error);
    } finally {
        await client.end();
    }
}

applyReservas();
