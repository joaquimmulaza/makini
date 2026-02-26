import pg from 'pg';

const { Client } = pg;

const client = new Client({
    connectionString: 'postgresql://postgres:angolamakini2026@db.lrfmxjdxyjlwzsfeixut.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        const query = `
            -- Policy to allow suppliers to delete their own listings
            DO $$ BEGIN
                CREATE POLICY "Suppliers can delete their own listings."
                ON public.listings FOR DELETE
                USING ( auth.uid() = fornecedor_id );
            EXCEPTION
                WHEN duplicate_object THEN NULL;
            END $$;

            -- Policy to allow suppliers to update their own listings
            DO $$ BEGIN
                CREATE POLICY "Suppliers can update their own listings."
                ON public.listings FOR UPDATE
                USING ( auth.uid() = fornecedor_id );
            EXCEPTION
                WHEN duplicate_object THEN NULL;
            END $$;
        `;

        console.log('Applying RLS policies for DELETE and UPDATE on listings...');
        await client.query(query);

        console.log('Policies applied successfully!');
    } catch (error) {
        console.error('Error applying policies:', error);
    } finally {
        await client.end();
    }
}

run();
