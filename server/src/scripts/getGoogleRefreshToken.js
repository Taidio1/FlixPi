/**
 * Script to get Google OAuth Refresh Token
 * Run this once to get your refresh token for Google Drive API
 * 
 * Usage: node src/scripts/getGoogleRefreshToken.js
 */

import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes for Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('\n===========================================');
console.log('Google Drive API - Get Refresh Token');
console.log('===========================================\n');
console.log('1. Visit this URL in your browser:\n');
console.log(authUrl);
console.log('\n2. Authorize the application');
console.log('3. Copy the code from the redirect URL\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the authorization code: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n===========================================');
    console.log('SUCCESS! Here is your refresh token:');
    console.log('===========================================\n');
    console.log(tokens.refresh_token);
    console.log('\n===========================================');
    console.log('Add this to your .env file as:');
    console.log('===========================================\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n');
  } catch (error) {
    console.error('Error getting tokens:', error);
  }
  
  rl.close();
});

