const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim().replace(/^"|"$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
  console.log('=== RELATÓRIO DE SINCRONIZAÇÃO SUPABASE ===');
  
  // 1. Leads
  const { data: leads, error: leadError } = await supabase
    .from('leads')
    .select('id, name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (leadError) {
    console.error('❌ Erro ao buscar Leads:', leadError.message);
  } else {
    console.log(`\n✅ LEADS (${leads.length} recentes):`);
    leads.forEach(l => console.log(`- ${l.name} [${l.status}] (Criado em: ${l.created_at})`));
  }

  // 2. Fluxos (Automations)
  const { data: flows, error: flowError } = await supabase
    .from('flows')
    .select('id, name, created_at')
    .order('created_at', { ascending: false });
    
  if (flowError) {
    console.error('❌ Erro ao buscar Fluxos:', flowError.message);
  } else {
    console.log(`\n✅ FLUXOS DE AUTOMAÇÃO (${flows.length} total):`);
    flows.forEach(f => console.log(`- ${f.name} (ID: ${f.id})`));
  }

  process.exit(0);
}
verify();
