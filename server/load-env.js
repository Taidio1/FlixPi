// ==========================================
// Load correct .env file based on NODE_ENV
// ==========================================
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;
const envPath = resolve(__dirname, envFile);

console.log(`[ENV] Loading environment: ${env}`);
console.log(`[ENV] Loading file: ${envFile}`);

const result = config({ path: envPath });

if (result.error) {
    console.error(`[ENV] Error loading ${envFile}:`, result.error.message);
    
    // Fallback to .env if specific env file doesn't exist
    console.log('[ENV] Falling back to .env');
    config();
} else {
    console.log(`[ENV] ✓ Loaded ${envFile} successfully`);
    console.log(`[ENV] NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`[ENV] PORT: ${process.env.PORT}`);
    console.log(`[ENV] CLIENT_URL: ${process.env.CLIENT_URL}`);
    console.log(`[ENV] USE_TEST_DATA: ${process.env.USE_TEST_DATA}`);
}
