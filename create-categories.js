import pg from 'pg';

const { Client } = pg;

const client = new Client({
    connectionString: 'postgresql://postgres:angolamakini2026@db.lrfmxjdxyjlwzsfeixut.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function createCategories() {
    try {
        await client.connect();
        console.log('Conectado. A criar tabela de categorias...');

        // Criar tabela categorias
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.categorias (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL UNIQUE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('Tabela "categorias" criada (ou já existia).');

        // Inserir categorias predefinidas
        const categorias = [
            'Preparação do Solo',
            'Plantio e Sementeira',
            'Aplicação de Insumos',
            'Colheita'
        ];

        for (const nome of categorias) {
            await client.query(
                `INSERT INTO public.categorias (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING;`,
                [nome]
            );
            console.log(`  ✓ Categoria inserida: ${nome}`);
        }

        // Habilitar RLS e criar policy de leitura pública
        await client.query(`ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;`);

        // Criar policy se não existir
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies 
                    WHERE tablename = 'categorias' 
                    AND policyname = 'Categorias são públicas para leitura'
                ) THEN
                    EXECUTE 'CREATE POLICY "Categorias são públicas para leitura" ON public.categorias FOR SELECT USING (true)';
                END IF;
            END
            $$;
        `);

        console.log('');
        console.log('✅ Categorias criadas com sucesso!');
        console.log('Categorias disponíveis: ' + categorias.join(', '));

    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await client.end();
    }
}

createCategories();
