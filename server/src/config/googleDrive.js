import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set refresh token
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
}

// Initialize Drive API
export const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

export { oauth2Client };

