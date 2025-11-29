import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validate keys
const validateKey = (key, name) => {
  if (!key) {
    console.error(`❌ Missing ${name}`);
    return;
  }
  // Check for non-ASCII characters (common copy-paste corruption)
  if (/[^\x00-\x7F]/.test(key)) {
    console.error(`❌ ${name} contains invalid characters! Check your .env file for encoding issues or corruption.`);
  }
};

validateKey(process.env.SUPABASE_ANON_KEY, 'SUPABASE_ANON_KEY');
validateKey(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');

// Client for user operations (with RLS)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client for service operations (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;

