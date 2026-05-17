const { createClient } = require('@supabase/supabase-js');


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variveis de ambiente do Supabase no encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
  console.log('--- Diagnstico Supabase ---');
  console.log('URL:', supabaseUrl);
  
  // 1. Testar conexo bsica
  const { data: leads, error: leadsError } = await supabase.from('leads').select('count');
  if (leadsError) {
    console.error('❌ Erro ao conectar na tabela "leads":', leadsError.message);
  } else {
    console.log('✅ Conexo bsica com Supabase OK (tabela "leads" acessvel)');
  }

  // 2. Verificar se a tabela "campaigns" existe
  const { data: campaigns, error: campaignsError } = await supabase.from('campaigns').select('count');
  if (campaignsError) {
    console.error('❌ Erro na tabela "campaigns":', campaignsError.message);
    if (campaignsError.code === '42P01') {
      console.log('👉 Diagnstico: A tabela "campaigns" no existe no banco de dados.');
    }
  } else {
    console.log('✅ Tabela "campaigns" encontrada!');
  }

  // 3. Testar insero na tabela "campaigns"
  console.log('\n--- Testando Insero ---');
  const { data: insertData, error: insertError } = await supabase
    .from('campaigns')
    .insert({
      title: 'Teste Diagnstico',
      channel: 'WhatsApp',
      status: 'Draft',
      sent: 0,
      converted: 0
    })
    .select();

  if (insertError) {
    console.error('❌ Erro ao inserir na tabela "campaigns":', insertError.message);
    console.error('Detalhes:', insertError.details);
    console.error('Dica:', insertError.hint);
  } else {
    console.log('✅ Insero de teste realizada com sucesso!');
    console.log('ID criado:', insertData[0].id);
    
    // Limpar teste
    await supabase.from('campaigns').delete().eq('id', insertData[0].id);
    console.log('✅ Registro de teste removido.');
  }
}

diagnose();
