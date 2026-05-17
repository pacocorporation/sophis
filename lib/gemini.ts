import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.warn("GEMINI_API_KEY não configurada no .env. A IA Nanda não funcionará.");
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

export const DEFAULT_SYSTEM_PROMPT = `Você é Nanda, assistente inteligente da Nanda Cloud. Especialista em atendimento farmacêutico e vendas. Seja cordial, persuasiva e humana.

SUAS COMPETÊNCIAS:
1. CONSULTA DE PRODUTOS: Você conhece profundamente medicamentos (originais, genéricos e similares), produtos de higiene, suplementos e cosméticos.
2. INTERPRETAÇÃO DE RECEITAS: Você identifica os possíveis medicamentos e alerta sobre a necessidade de validação pelo farmacêutico.
3. ATENDIMENTO AO CLIENTE: Empática, resolve dúvidas sobre horários, entregas e formas de pagamento.
4. FOCO EM VENDAS: Guia a conversa para a conclusão de um pedido. Se o cliente está em dúvida, sugira produtos complementares.

DIRETRIZES DE SEGURANÇA:
- Nunca faça diagnósticos médicos definitivos.
- Para queixas de saúde, sempre recomende a consulta com um profissional médico ou farmacêutico.
- Não prometa cura para doenças graves.

TOM DE VOZ: Profissional, acolhedor, rápido e eficiente. Use português do Brasil.`;

export interface NandaOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  trainingExamples?: { question: string; answer: string }[];
  products?: { name: string; price: number; stock: number; category: string }[];
}

export async function askNanda(prompt: string, options: NandaOptions = {}) {
  const {
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    temperature = 0.7,
    maxTokens = 1024,
    trainingExamples = [],
    products = [],
  } = options;

  const examplesBlock = trainingExamples.length > 0
    ? `\n\nEXEMPLOS DE RESPOSTAS IDEAIS:\n${trainingExamples.slice(0, 20).map(ex =>
      `Pergunta: "${ex.question}"\nResposta: "${ex.answer}"`
    ).join('\n\n')}`
    : '';

  const inventoryBlock = products.length > 0
    ? `\n\nINVENTÁRIO DISPONÍVEL:\n${products.slice(0, 50).map(p =>
      `• ${p.name} — R$ ${p.price.toFixed(2)} — Estoque: ${p.stock}`
    ).join('\n')}`
    : '';

  const fullSystemInstruction = `${systemPrompt}${inventoryBlock}${examplesBlock}`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Usando 1.5-flash como padrão estável
      systemInstruction: fullSystemInstruction,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) throw new Error("Resposta da IA vazia");
    return text;
  } catch (error) {
    console.error("Erro na IA Nanda:", error);
    return "Desculpe, estou processando muitas receitas agora. Como posso ajudar de outra forma?";
  }
}
