'use client';

import { supabase } from './supabase';
import { askNanda } from './gemini';

export const simFunctions = {
  enviarWhatsApp: async (mensagem: string, telefone: string) => {
    console.log(`[SIMULATION] WhatsApp enviado para ${telefone}: ${mensagem}`);
    
    try {
      // Tenta logar no Supabase, mas não trava se a tabela não existir
      await supabase.from('logs').insert({
        level: 'info',
        message: `WhatsApp enviado para ${telefone}`,
        metadata: { mensagem, telefone, type: 'whatsapp' }
      });
    } catch (e) {
      console.warn("[WARN] Tabela 'logs' não encontrada no Supabase. Ignorando log.");
    }

    return { success: true, timestamp: new Date().toISOString() };
  },
  consultarEstoque: async (produto: string) => {
    console.log(`[SIMULATION] Consultando estoque para ${produto}`);
    
    // Busca flexível por nome ou slug
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${produto}%,slug.eq.${produto.toLowerCase().replace(/\s+/g, '-')}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { status: 'indisponivel', quantity: 0 };
    }

    return { ...data, status: 'disponivel' };
  },
  consultarPreco: async (produto: string) => {
    console.log(`[SIMULATION] Consultando preço para ${produto}`);

    const { data, error } = await supabase
      .from('products')
      .select('price')
      .or(`name.ilike.%${produto}%,slug.eq.${produto.toLowerCase().replace(/\s+/g, '-')}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { error: 'Produto não encontrado' };
    }

    return { price: data.price };
  }
};

export interface FlowNode {
  id: string;
  type: string;
  data: any;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
}

export interface FlowDefinition {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export class FlowEngine {
  private def: FlowDefinition;
  private currentNodeId: string | null = null;
  private context: any = {};
  private logs: string[] = [];

  constructor(definition: FlowDefinition, initialContext: any = {}) {
    this.def = definition;
    this.context = initialContext;
  }

  getLogs() {
    return this.logs;
  }

  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
    console.log(`[FlowEngine] ${message}`);
  }

  async run() {
    const startNode = this.def.nodes.find(n => n.type === 'start');
    if (!startNode) throw new Error('Fluxo sem node de início');
    
    this.currentNodeId = startNode.id;
    this.addLog('Iniciando execução do fluxo...');
    
    let iterations = 0;
    while (this.currentNodeId && iterations < 50) { // Safety limit
      iterations++;
      const node = this.def.nodes.find(n => n.id === this.currentNodeId);
      if (!node) break;

      this.addLog(`Executando bloco: ${node.type} (${node.id})`);
      await this.executeNode(node);
      
      this.currentNodeId = this.getNextNodeId(node);
    }
    
    this.addLog('Fluxo finalizado com sucesso.');
  }

  private async executeNode(node: FlowNode) {
    switch (node.type) {
      case 'message':
        const msg = node.data.message || 'Olá, como posso ajudar?';
        await simFunctions.enviarWhatsApp(msg, this.context.userPhone || '5511999999999');
        this.addLog(`Mensagem enviada: "${msg}"`);
        break;
      case 'ai_nanda':
        this.addLog('Processando com IA Nanda...');
        const prompt = this.context.lastMessage || "Olá Nanda, analise esta receita.";
        // CORREÇÃO: askNanda espera um objeto como segundo argumento
        const response = await askNanda(prompt, { 
            systemPrompt: "Você é Nanda e está processando um fluxo de automação. Contexto: " + JSON.stringify(this.context)
        });
        const safeResponse = response || "Nenhuma resposta gerada";
        this.context.aiResponse = safeResponse;
        this.addLog(`IA Nanda respondeu: ${safeResponse.substring(0, 50)}...`);
        break;
      case 'condition':
        this.addLog('Avaliando condição lógica...');
        this.context.conditionResult = (this.context.lastMessage || '').toLowerCase().includes('receita');
        this.addLog(`Resultado da condição: ${this.context.conditionResult ? 'Verdadeiro' : 'Falso'}`);
        break;
      case 'webhook':
        this.addLog(`Disparando Webhook para: ${node.data.url || 'http://webhook.site/test'}`);
        break;
      case 'transfer':
        this.addLog('Fluxo transferido para atendente humano no CRM.');
        break;
      case 'delay':
        const seconds = node.data.seconds || 2;
        this.addLog(`Aguardando ${seconds} segundos...`);
        await new Promise(resolve => setTimeout(resolve, seconds * 1000));
        break;
      case 'code':
        this.addLog('Executando script personalizado...');
        this.context.codeOutput = "Script executed successfully";
        break;
      case 'schedule':
        this.addLog('Consultando tabela de horários da farmácia...');
        this.context.isOpen = true; 
        break;
      case 'end':
        this.addLog('Chegou ao final do fluxo.');
        break;
      default:
        this.addLog(`Tipo de bloco desconhecido: ${node.type}`);
        break;
    }
  }

  private getNextNodeId(node: FlowNode): string | null {
    const edges = this.def.edges.filter(e => e.source === node.id);
    
    if (node.type === 'condition') {
      const result = this.context.conditionResult ? 'true' : 'false';
      const edge = edges.find(e => e.sourceHandle === result);
      return edge ? edge.target : null;
    }

    return edges[0]?.target || null;
  }
}
