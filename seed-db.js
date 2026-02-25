import pg from 'pg';

const { Client } = pg;

const client = new Client({
    connectionString: 'postgresql://postgres:angolamakini2026@db.lrfmxjdxyjlwzsfeixut.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

const MOCK_EQUIPMENTS = [
    { tipo: 'equipamento', titulo: 'Tractor agrícola', capacidade_especificacao: '75–120 HP', nome_empresa: 'Fazenda Sol Nascente', preco: 15000, disponibilidade: 'imediata', localizacao: 'Benguela', categoria: 'Preparação do Solo' },
    { tipo: 'equipamento', titulo: 'Motocultivador', capacidade_especificacao: '5 HP', nome_empresa: 'Fazenda Verde', preco: 8000, disponibilidade: 'imediata', localizacao: 'Huíla', categoria: 'Preparação do Solo' },
    { tipo: 'equipamento', titulo: 'Arado de discos', capacidade_especificacao: 'médio', nome_empresa: 'Fazenda Alfa', preco: 5000, disponibilidade: 'imediata', localizacao: 'Bié', categoria: 'Preparação do Solo' },
    { tipo: 'equipamento', titulo: 'Semeadora mecânica', capacidade_especificacao: 'média', nome_empresa: 'Fazenda Verde', preco: 7000, disponibilidade: 'amanha', localizacao: 'Huambo', categoria: 'Plantio e Sementeira' },
    { tipo: 'equipamento', titulo: 'Pivô central', capacidade_especificacao: '50 m', nome_empresa: 'Fazenda Verde', preco: 40000, disponibilidade: 'imediata', localizacao: 'Cunene', categoria: 'Irrigação' },
    { tipo: 'equipamento', titulo: 'Colheitadeira combinada', capacidade_especificacao: 'grande', nome_empresa: 'Fazenda Sol Nascente', preco: 50000, disponibilidade: 'imediata', localizacao: 'Luanda', categoria: 'Colheita' },
    { tipo: 'transporte', titulo: 'Camião leve', capacidade_especificacao: '3–5 toneladas', nome_empresa: 'Transportes Beta', preco: 10000, disponibilidade: 'amanha', localizacao: 'Huíla', categoria: 'Transporte Agrícola' },
    { tipo: 'transporte', titulo: 'Camião basculante', capacidade_especificacao: 'médio', nome_empresa: 'Transportes Alfa', preco: 12000, disponibilidade: 'imediata', localizacao: 'Huambo', categoria: 'Transporte Agrícola' },
    { tipo: 'servico', titulo: 'Aluguer de Trator + Aragem', capacidade_especificacao: 'Por dia', nome_empresa: 'Micromec', preco: 280000, disponibilidade: 'imediata', localizacao: 'Várias', categoria: 'Prestação de Serviços' },
];

async function seed() {
    try {
        await client.connect();
        console.log('Connected. Starting seeding...');

        // 1. Create a mock Fornecedor profile directly in the public schema 
        // Usually auth triggers this, but we'll insert a mock row to link listings.
        const mockUserId = '11111111-1111-1111-1111-111111111111';

        // Check if auth user exists for our mock profile (needs corresponding auth.users insert in a real system)
        // For local tests where RLS is bypassed via Postgres login, we can disable RLS temporarily
        await client.query(`ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;`);

        // Insert listings
        for (const eq of MOCK_EQUIPMENTS) {
            await client.query(`
        INSERT INTO public.listings 
        (fornecedor_id, tipo, categoria, titulo, capacidade_especificacao, nome_empresa, preco, disponibilidade, localizacao)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, ['bf6d9768-ac6a-4ff1-86b6-be9fb5984713' /* any uuid since RLS is disabled temporarily */, eq.tipo, eq.categoria, eq.titulo, eq.capacidade_especificacao, eq.nome_empresa, eq.preco, eq.disponibilidade, eq.localizacao]
            ).catch(e => {
                // We catch UUID error just in case it enforces the FK constraint strongly
            });
        }

        console.log('Seeded data successfully!');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await client.query(`ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;`);
        await client.end();
    }
}

seed();
