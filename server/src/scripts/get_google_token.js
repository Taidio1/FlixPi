import { google } from 'googleapis';
import dotenv from 'dotenv';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env.development') });

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.log('--- Google Drive Token Generator ---');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'OK' : 'MISSING');
console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'OK' : 'MISSING');
console.log('Redirect URI:', process.env.GOOGLE_CLIENT_URI || 'http://localhost:5000/oauth2callback');

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force to get refresh_token
});

console.log('\n1. Authorize this app by visiting this url:');
console.log(authUrl);

rl.question('\n2. Enter the code from that page here: ', async (code) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('\n✅ Successfully retrieved tokens!');

        if (tokens.refresh_token) {
            console.log('\nCopy this REFRESH TOKEN to your .env.development file:');
            console.log('===================================================');
            console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
            console.log('===================================================');
        } else {
            console.log('\n⚠️ No refresh token received. Did you try to authorize again without "prompt: consent"?');
            console.log('Access Token (valid for 1h):', tokens.access_token);
        }
    } catch (err) {
        console.error('\n❌ Error retrieving access token:', err.message);
    }
    rl.close();
});
