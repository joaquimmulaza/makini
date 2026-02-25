import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://lrfmxjdxyjlwzsfeixut.supabase.co',
    'sb_publishable_jg-86N2hiQysmupXpYk7ZA_ZU4fDykq'
);

async function run() {
    console.log("Creating temporary supplier...");
    const tempEmail = 'supplier.temp_' + Date.now() + '@example.com';
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: 'password123',
        options: {
            data: {
                role: 'fornecedor',
                nome_completo: 'Fornecedor Automatizado',
                nif: 'nif-temp-123',
                documento_url: 'mock.pdf'
            }
        }
    });

    if (authError || !authData.user) {
        console.error("Failed to create provider:", authError);
        return;
    }

    const fornecedorId = authData.user.id;
    console.log("Temp Supplier ID:", fornecedorId);

    const listings = [
        {
            fornecedor_id: fornecedorId,
            tipo: 'equipamento',
            categoria: 'Preparação do Solo',
            titulo: 'Tractor Agrícola 4x4 (Teste)',
            capacidade_especificacao: '75 HP',
            nome_empresa: 'Fornecedor Automatizado',
            preco: 15000,
            unidade_preco: 'kz / hora',
            disponibilidade: 'imediata',
            localizacao: 'Huambo'
        },
        {
            fornecedor_id: fornecedorId,
            tipo: 'transporte',
            categoria: 'Transporte de Grãos',
            titulo: 'Camião Basculante 10t (Teste)',
            capacidade_especificacao: '10 Toneladas',
            nome_empresa: 'Fornecedor Automatizado',
            preco: 45000,
            unidade_preco: 'kz / dia',
            disponibilidade: 'amanha',
            localizacao: 'Huambo'
        },
        {
            fornecedor_id: fornecedorId,
            tipo: 'servico',
            categoria: 'Colheita',
            titulo: 'Equipe de Colheita Manual (Teste)',
            capacidade_especificacao: '10 pessoas',
            nome_empresa: 'Fornecedor Automatizado',
            preco: 50000,
            unidade_preco: 'kz / dia',
            disponibilidade: 'imediata',
            localizacao: 'Bengo'
        }
    ];

    console.log("Seeding listings...");
    const { data, error } = await supabase.from('listings').insert(listings).select();
    console.log("Seeded listings:", data?.length, "Error:", error);
}

run();
