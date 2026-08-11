import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  try {
    const { data, error } = await supabase.from('pendaftar').select('*').limit(1);
    
    if (error) {
      console.error('Connection failed or table "pendaftar" does not exist yet:');
      console.error(error.message);
    } else {
      console.log('Connection successful!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
