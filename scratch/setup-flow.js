const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim().replace(/^"|"$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const flowData = {
  name: 'Atendimento Inteligente Drogaria Max',
  definition: {
    nodes: [
      { id: 'start_root', type: 'start', position: { x: 50, y: 50 }, data: { label: 'Início', description: 'Entrada principal' } },
      { id: 'cond_entry', type: 'condition', position: { x: 50, y: 250 }, data: { label: 'Condição com variáveis', description: 'Filtro de entrada' } },
      { id: 'path_default', type: 'message', position: { x: 350, y: 180 }, data: { label: 'Padrão', description: 'Seguir fluxo normal', message: 'Iniciando atendimento padrão...' } },
      { id: 'path_limit', type: 'message', position: { x: 350, y: 320 }, data: { label: '50 correspon...', description: 'Limite atingido', message: 'No momento não podemos processar sua solicitação.' } },
      { id: 'end_node', type: 'terminate', position: { x: 650, y: 320 }, data: { label: 'Encerrar', description: 'Fim do fluxo' } },
      { id: 'schedule_1', type: 'schedule', position: { x: 750, y: 180 }, data: { label: 'Tabela de horários', description: 'Seg-Sáb (07:30-23:00) / Dom (08:00-22:45)' } },
      { id: 'msg_info', type: 'message', position: { x: 1050, y: 50 }, data: { label: 'Mensagem de Informação', description: 'Aviso de horário', message: 'Olá! No momento estamos fora do nosso horário de atendimento humano. A Nanda IA pode te ajudar agora.' } },
      { id: 'transfer_1', type: 'transfer', position: { x: 1350, y: 50 }, data: { label: 'Transferir', description: 'Encaminhar para fila CRM' } },
      { id: 'msg_promo', type: 'message', position: { x: 1050, y: 250 }, data: { 
        label: 'Ofertas de Maio', 
        description: 'Promoção ativa', 
        message: '🔥 E MAIO DE OFERTAS NA DROGARIA MAX! 🔥\n\nChegou a hora de economizar de verdade! 💥',
        images: [] 
      } },
      { id: 'trigger_timer', type: 'wait', position: { x: 50, y: 550 }, data: { label: 'Timer/Espera', description: 'Gatilho secundário' } },
      { id: 'transfer_direct', type: 'transfer', position: { x: 250, y: 550 }, data: { label: 'Transferir', description: 'Envio direto' } }
    ],
    edges: [
      { id: 'e_root_cond', source: 'start_root', target: 'cond_entry' },
      { id: 'e_cond_default', source: 'cond_entry', target: 'path_default', label: 'Padrão' },
      { id: 'e_cond_limit', source: 'cond_entry', target: 'path_limit', label: '50 correspon...' },
      { id: 'e_limit_end', source: 'path_limit', target: 'end_node' },
      { id: 'e_default_sched', source: 'path_default', target: 'schedule_1' },
      { id: 'e_sched_out', source: 'schedule_1', target: 'msg_info', label: 'Fora do Horário' },
      { id: 'e_info_trans', source: 'msg_info', target: 'transfer_1' },
      { id: 'e_sched_in', source: 'schedule_1', target: 'msg_promo', label: 'Dentro do Horário' },
      { id: 'e_timer_trans', source: 'trigger_timer', target: 'transfer_direct' }
    ]
  }
};

async function save() {
  console.log('Limpando fluxo antigo e salvando nova estrutura...');
  await supabase.from('flows').delete().eq('name', 'Atendimento Inteligente Drogaria Max');
  
  const { data, error } = await supabase.from('flows').insert([flowData]);
  if (error) {
    console.error('Erro ao salvar:', error.message);
    process.exit(1);
  }
  console.log('Nova estrutura salva com sucesso!');
  process.exit(0);
}
save();
