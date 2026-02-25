import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://lrfmxjdxyjlwzsfeixut.supabase.co',
    'sb_publishable_jg-86N2hiQysmupXpYk7ZA_ZU4fDykq'
);

async function run() {
    console.log("Checking profiles...");
    const { data: pData, error: pErr } = await supabase.from('profiles').select('*');
    console.log("Profiles:", pData, "Error:", pErr);

    console.log("Checking listings...");
    const { data: lData, error: lErr } = await supabase.from('listings').select('*');
    console.log("Listings:", lData, "Error:", lErr);
}

run();
