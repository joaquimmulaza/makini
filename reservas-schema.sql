-- 1. Create Reservation Status Enum
DROP TYPE IF EXISTS reserva_status CASCADE;
CREATE TYPE reserva_status AS ENUM ('pendente', 'aprovada', 'rejeitada', 'cancelada');

-- 2. Create Reservas Table
DROP TABLE IF EXISTS public.reservas CASCADE;
CREATE TABLE public.reservas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agricultor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    fornecedor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    anuncio_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    dias_solicitados TEXT NOT NULL,
    contexto TEXT,
    status reserva_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Agricultor can see their own reservations
CREATE POLICY "Agricultores podem ver as suas reservas."
ON public.reservas FOR SELECT
USING ( auth.uid() = agricultor_id );

-- Fornecedor can see reservations made to their listings
CREATE POLICY "Fornecedores podem ver pedidos recebidos."
ON public.reservas FOR SELECT
USING ( auth.uid() = fornecedor_id );

-- Agricultor can create a reservation
CREATE POLICY "Agricultores podem criar reservas."
ON public.reservas FOR INSERT
WITH CHECK ( auth.uid() = agricultor_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'agricultor') );

-- Fornecedor can update reservation status (approve/reject)
CREATE POLICY "Fornecedores podem atualizar status das reservas deles."
ON public.reservas FOR UPDATE
USING ( auth.uid() = fornecedor_id );
