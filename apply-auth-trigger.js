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
        const schema = fs.readFileSync('./auth-trigger.sql', 'utf8');

        console.log('Applying Trigger...');
        await client.query(schema);

        console.log('Trigger applied successfully!');
    } catch (error) {
        console.error('Error applying trigger:', error);
    } finally {
        await client.end();
    }
}

run();
