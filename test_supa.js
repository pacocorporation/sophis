const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_ANON_KEY = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  console.log('SELECT:', error || 'OK');
  
  const { error: delErr } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('DELETE:', delErr || 'OK');
  
  const { error: insErr } = await supabase.from('products').insert([{ name: 'Teste', slug: 'teste', price: 10, quantity: 5, category: 'Geral' }]);
  console.log('INSERT:', insErr || 'OK');
}
test();
