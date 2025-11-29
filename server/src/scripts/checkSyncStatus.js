import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkContent() {
    console.log('--- Checking Content Table Schema & Data ---');

    // Try to fetch with ordering by created_at to see if it exists
    const { data: movies, error } = await supabase
        .from('content')
        .select('*')
        .eq('content_type', 'movie')
        .limit(5);

    if (error) {
        console.error('Error fetching movies:', error);
    } else {
        console.log(`Fetched ${movies.length} movies.`);
        if (movies.length > 0) {
            console.log('Sample Movie Data:', JSON.stringify(movies[0], null, 2));

            // Check if created_at exists in the returned object
            if ('created_at' in movies[0]) {
                console.log('✅ created_at column exists.');
            } else {
                console.log('❌ created_at column is MISSING in the returned data.');
            }

            // Check category field
            if ('category' in movies[0]) {
                console.log(`Category: ${movies[0].category}`);
            } else {
                console.log('❌ category field is missing/null');
            }
        }
    }
}

checkContent();
