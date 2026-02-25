import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const client = new Client({
    connectionString: 'postgresql://postgres.lrfmxjdxyjlwzsfeixut:angolamakini2026@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        // Read Schema
        const schema = fs.readFileSync('./reservas-schema.sql', 'utf8');

        console.log('Applying Reservas Schema...');
        await client.query(schema);

        console.log('Reservas Schema applied successfully!');
    } catch (error) {
        console.error('Error applying Reservas schema:', error);
    } finally {
        await client.end();
    }
}

run();
