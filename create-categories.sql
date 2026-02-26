-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS public.categorias (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir categorias predefinidas
INSERT INTO public.categorias (nome) VALUES
    ('Preparação do Solo'),
    ('Plantio e Sementeira'),
    ('Aplicação de Insumos'),
    ('Colheita')
ON CONFLICT (nome) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Policy para leitura pública (qualquer utilizador autenticado pode ler)
CREATE POLICY "Categorias são públicas para leitura"
    ON public.categorias
    FOR SELECT
    USING (true);
