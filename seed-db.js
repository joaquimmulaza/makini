import pg from 'pg';

/**
 * PRODUCTION-GRADE SEED SCRIPT
 *
 * Features:
 * - Security: Uses environment variables (DATABASE_URL) and removes hardcoded secrets.
 * - Safety: All operations wrapped in a database transaction.
 * - Scalability: Implements chunked batch inserts (default 500 rows).
 * - Robustness: Comprehensive error handling and structured logging.
 * - Maintainability: Clean code with extracted constants.
 */

const { Client } = pg;

// Configuration Constants
const DATABASE_URL = process.env.DATABASE_URL;
const CHUNK_SIZE = 500;
const DEFAULT_FORNECEDOR_ID = 'bf6d9768-ac6a-4ff1-86b6-be9fb5984713';

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

/**
 * Seed the database with mock equipment listings.
 */
async function seed(ClientOverride = Client) {
    if (!DATABASE_URL && ClientOverride === Client) {
        throw new Error('[SEED] Missing DATABASE_URL environment variable.');
    }

    const client = new ClientOverride({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    console.log('[SEED] Starting database seeding process...');

    let isConnected = false;
    let rlsDisabled = false;

    try {
        await client.connect();
        isConnected = true;
        console.log('[SEED] Connected to PostgreSQL.');

        // Start Transaction
        await client.query('BEGIN');
        console.log('[SEED] Transaction started.');

        // Disable RLS temporarily for mass insertion
        await client.query('ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;');
        rlsDisabled = true;
        console.log('[SEED] Row Level Security (RLS) disabled.');

        // Process data in chunks
        for (let i = 0; i < MOCK_EQUIPMENTS.length; i += CHUNK_SIZE) {
            const chunk = MOCK_EQUIPMENTS.slice(i, i + CHUNK_SIZE);
            const values = [];
            const placeholders = [];
            let paramCount = 1;

            console.log(`[SEED] Processing batch ${Math.floor(i / CHUNK_SIZE) + 1} (Size: ${chunk.length})...`);

            for (const eq of chunk) {
                const rowPlaceholders = [];
                for (let j = 0; j < 9; j++) {
                    rowPlaceholders.push(`$${paramCount++}`);
                }
                placeholders.push(`(${rowPlaceholders.join(', ')})`);
                values.push(
                    DEFAULT_FORNECEDOR_ID,
                    eq.tipo,
                    eq.categoria,
                    eq.titulo,
                    eq.capacidade_especificacao,
                    eq.nome_empresa,
                    eq.preco,
                    eq.disponibilidade,
                    eq.localizacao
                );
            }

            if (chunk.length > 0) {
                const query = `
                    INSERT INTO public.listings
                    (fornecedor_id, tipo, categoria, titulo, capacidade_especificacao, nome_empresa, preco, disponibilidade, localizacao)
                    VALUES ${placeholders.join(', ')}
                `;

                try {
                    await client.query(query, values);
                } catch (batchError) {
                    console.error(`[SEED] Batch insert failed at index ${i}:`, {
                        batchSize: chunk.length,
                        message: batchError.message
                    });
                    throw batchError; // Trigger rollback
                }
            }
        }

        // Re-enable RLS
        await client.query('ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;');
        rlsDisabled = false;
        console.log('[SEED] Row Level Security (RLS) re-enabled.');

        // Commit Transaction
        await client.query('COMMIT');
        console.log('[SEED] Seeding successful! Transaction committed.');

    } catch (err) {
        // Rollback on any failure
        console.error('[SEED] Seeding error encountered. Attempting rollback...', {
            message: err.message
        });

        if (isConnected) {
            try {
                await client.query('ROLLBACK');
                console.log('[SEED] Rollback complete.');

                // Ensure RLS is re-enabled even on rollback if it was disabled
                if (rlsDisabled) {
                    await client.query('ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;');
                    console.log('[SEED] Row Level Security (RLS) re-enabled after rollback.');
                }
            } catch (rollbackErr) {
                console.error('[SEED] Failed to rollback or re-enable RLS:', rollbackErr.message);
            }
        }

        // Re-throw the error to ensure proper exit code when run from CLI
        throw err;
    } finally {
        // Always close the connection
        if (isConnected) {
            try {
                await client.end();
                console.log('[SEED] Connection closed.');
            } catch (endErr) {
                console.error('[SEED] Error closing connection:', endErr.message);
            }
        }
    }
}

// Run the script if executed directly
const isMain = import.meta.url.endsWith(process.argv[1]) || (process.argv[1] && import.meta.url.includes(process.argv[1]));
if (isMain) {
    // Note: Use 'node --env-file=.env seed-db.js' in Node.js 20.6+ or an external loader for .env support
    seed().catch(err => {
        console.error('[SEED] Fatal error:', err.message);
        process.exit(1);
    });
}

export { seed };
