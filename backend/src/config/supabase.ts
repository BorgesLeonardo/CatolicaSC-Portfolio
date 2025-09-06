import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL || 'https://jbuozkvrslranpnjtsen.supabase.co';
const supabaseKey =
  process.env.SUPABASE_ANON_KEY || process.env.CLERK_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey!);

export default supabase;
