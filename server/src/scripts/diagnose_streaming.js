import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, '../../');

// Try loading .env.development first, then .env
const envDevPath = path.join(serverDir, '.env.development');
const envPath = path.join(serverDir, '.env');

if (fs.existsSync(envDevPath)) {
    console.log(`Loading env from ${envDevPath}`);
    dotenv.config({ path: envDevPath });
} else if (fs.existsSync(envPath)) {
    console.log(`Loading env from ${envPath}`);
    dotenv.config({ path: envPath });
} else {
    console.error('❌ No .env file found');
    process.exit(1);
}

console.log('--- DIAGNOSIS START ---');

// 1. Check Env Vars
console.log('Checking Environment Variables...');
const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN'
];
const missingVars = requiredVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    console.error('❌ Missing env vars:', missingVars);
    process.exit(1);
}
console.log('✅ Env vars present');

// 2. Check Supabase
console.log('\nChecking Supabase Connection...');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: movies, error: dbError } = await supabase
    .from('content')
    .select('*')
    .limit(1);

if (dbError) {
    console.error('❌ Supabase error:', dbError);
    process.exit(1);
}

if (!movies || movies.length === 0) {
    console.warn('⚠️ No movies found in DB');
} else {
    console.log(`✅ Found ${movies.length} movies`);
    console.log('Sample movie:', {
        id: movies[0].id,
        title: movies[0].title,
        google_drive_file_id: movies[0].google_drive_file_id
    });
}

// 3. Check Google Drive
console.log('\nChecking Google Drive API...');
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
});

if (movies && movies.length > 0 && movies[0].google_drive_file_id) {
    const fileId = movies[0].google_drive_file_id;
    console.log(`Verifying file ID: ${fileId}`);

    try {
        const file = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, mimeType, size'
        });
        console.log('✅ File found on Drive:', file.data);

        // Test streaming capability (just metadata)
        console.log('Testing stream access...');
        try {
            const streamCheck = await drive.files.get({
                fileId: fileId,
                alt: 'media'
            }, { responseType: 'stream' });
            console.log('✅ Stream access confirmed (status):', streamCheck.status);
        } catch (streamErr) {
            console.error('❌ Stream access failed:', streamErr.message);
        }

    } catch (err) {
        console.error('❌ Drive API Error:', err.message);
        if (err.response) {
            console.error('Response data:', err.response.data);
        }
    }
} else {
    console.log('⚠️ Skipping Drive check (no movie or no file ID)');
}

console.log('\n--- DIAGNOSIS END ---');
