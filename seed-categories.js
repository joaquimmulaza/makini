import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lrfmxjdxyjlwzsfeixut.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Tenta usar a service key (bypass RLS) se disponível, caso contrário usa anon key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZm14amR4eWpsd3pzZmVpeHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NzM1MzUsImV4cCI6MjA1NjA0OTUzNX0.VN4TS9rCPH4OVZqXLV-8JNXetdcxJqvuG-9sifNXFbA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY);

const CATEGORIAS = [
    'Preparação do Solo',
    'Plantio e Sementeira',
    'Aplicação de Insumos',
    'Colheita'
];

async function seedCategories() {
    console.log('A inserir categorias na base de dados...\n');

    // Verificar se já existem categorias
    const { data: existing, error: selectError } = await supabase
        .from('categorias')
        .select('nome');

    if (selectError) {
        console.error('Erro ao consultar categorias:', selectError.message);
        console.log('\n⚠️  A tabela "categorias" pode não existir ainda.');
        console.log('Por favor, execute o seguinte SQL no painel Supabase (SQL Editor):');
        console.log(`
-- ============================================================
-- COPIE E EXECUTE ESTE SQL NO SUPABASE SQL EDITOR
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categorias (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.categorias (nome) VALUES
    ('Preparação do Solo'),
    ('Plantio e Sementeira'),
    ('Aplicação de Insumos'),
    ('Colheita')
ON CONFLICT (nome) DO NOTHING;

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias são públicas para leitura"
    ON public.categorias
    FOR SELECT
    USING (true);
        `);
        return;
    }

    console.log(`Categorias já existentes: ${existing?.length || 0}`);

    // Inserir apenas categorias que não existem
    for (const nome of CATEGORIAS) {
        const exists = existing?.some(c => c.nome === nome);
        if (exists) {
            console.log(`  ⏭  Já existe: ${nome}`);
            continue;
        }

        const { error } = await supabase
            .from('categorias')
            .insert({ nome });

        if (error) {
            console.error(`  ✗  Erro ao inserir "${nome}":`, error.message);
        } else {
            console.log(`  ✓  Inserida: ${nome}`);
        }
    }

    // Listar categorias finais
    const { data: final } = await supabase.from('categorias').select('id, nome').order('id');
    console.log('\nCategorias na base de dados:');
    final?.forEach(c => console.log(`  [${c.id}] ${c.nome}`));
    console.log('\n✅ Concluído!');
}

seedCategories();
