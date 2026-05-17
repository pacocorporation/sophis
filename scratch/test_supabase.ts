import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
  
  if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
    console.error('Connection failed:', error.message);
    process.exit(1);
  } else {
    console.log('Connection successful! (Even if table doesn\'t exist, API responded)');
    process.exit(0);
  }
}

testConnection();
