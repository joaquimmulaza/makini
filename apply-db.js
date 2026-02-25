import pg from 'pg';
import fs from 'fs';

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

        // Read Schema
        const schema = fs.readFileSync('./supabase-schema.sql', 'utf8');

        console.log('Applying Schema...');
        await client.query(schema);

        console.log('Schema applied successfully!');
    } catch (error) {
        console.error('Error applying schema:', error);
    } finally {
        await client.end();
    }
}

run();
