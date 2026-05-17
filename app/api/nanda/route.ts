import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const MODEL_NAME = 'gemini-2.5-flash';

// Carrega a Skill personalizada se existir
function getCustomSkill() {
  try {
    const skillPath = path.join(process.cwd(), 'agents', 'nanda_farma', 'skill.md');
    if (fs.existsSync(skillPath)) {
      return fs.readFileSync(skillPath, 'utf-8');
    }
  } catch (e) {
    console.warn('Skill file not found or unreadable');
  }
  return null;
}

// Keyword-based intent analysis (works even when API is unavailable)
function analyzeIntent(prompt: string) {
  const lower = prompt.toLowerCase();
  const riskKeywords = ['dor', 'febre', 'alergia', 'infecção', 'receita', 'sintoma', 'remédio', 'doendo', 'mal'];
  const buyKeywords  = ['comprar', 'preço', 'quanto', 'quero', 'preciso', 'tem', 'disponível', 'valor', 'custa'];
  const riskScore = riskKeywords.filter(k => lower.includes(k)).length;
  const buyScore  = buyKeywords.filter(k => lower.includes(k)).length;
  const riskLevel = riskScore >= 3 ? 'Alto Risco' : riskScore >= 1 ? 'Médio Risco' : 'Baixo Risco';
  const buyIntent =
    buyScore >= 3 ? `${Math.min(95, 60 + buyScore * 8)}% — Quente 🔥`
    : buyScore >= 1 ? `${30 + buyScore * 10}% — Morno`
    : '< 20% — Frio';
  return { riskLevel, buyIntent };
}

// Friendly fallback when Gemini quota is exceeded
function buildFallbackResponse(prompt: string, trainingExamples: { question: string; answer: string }[] = []) {
  const lower = prompt.toLowerCase();
  const match = trainingExamples.find(ex =>
    ex.question.toLowerCase().split(' ').some(word => word.length > 4 && lower.includes(word))
  );
  if (match) return match.answer;

  if (lower.includes('preço') || lower.includes('quanto') || lower.includes('custa'))
    return 'Para verificar o preço deste produto, por favor entre em contato diretamente com nossa equipe ou consulte nosso catálogo atualizado. Posso ajudar com mais alguma dúvida?';
  if (lower.includes('dor') || lower.includes('sintoma') || lower.includes('doendo'))
    return 'Entendo seu desconforto! Para sintomas de saúde, recomendo consultar um farmacêutico ou médico para orientação segura. Posso mostrar opções de alívio disponíveis no estoque enquanto isso?';
  return 'Olá! Sou a Nanda, assistente da farmácia. Como posso ajudar você hoje? Posso tirar dúvidas sobre produtos, medicamentos e pedidos!';
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, systemPrompt, temperature, maxTokens, trainingExamples, products, imageBase64, imageMimeType } =
      await req.json();

    const customSkill = getCustomSkill();
    // A skill do arquivo tem prioridade sobre o prompt genérico
    const baseSystemPrompt = customSkill || systemPrompt || 'Você é Nanda, assistente inteligente de uma farmácia.';

    const { riskLevel, buyIntent } = analyzeIntent(prompt || '');

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY não configurada no .env', riskLevel, buyIntent },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const inventoryBlock = products?.length > 0
      ? `\n\nINVENTÁRIO DISPONÍVEL:\n${products.slice(0, 50)
          .map((p: { name: string; price: number; stock: number; category: string }) =>
            `• ${p.name} — R$ ${p.price.toFixed(2)} — Estoque: ${p.stock} — ${p.category}`)
          .join('\n')}`
      : '';

    const examplesBlock = trainingExamples?.length > 0
      ? `\n\nEXEMPLOS DE RESPOSTAS IDEAIS:\n${trainingExamples.slice(0, 20)
          .map((ex: { question: string; answer: string }) => `Pergunta: "${ex.question}"\nResposta: "${ex.answer}"`)
          .join('\n\n')}`
      : '';

    const fullSystemInstruction = `${baseSystemPrompt}\n\nREGRAS IMPORTANTES:\n1. Sempre consulte o INVENTÁRIO DISPONÍVEL abaixo antes de responder.\n2. Se o cliente enviar uma receita, identifique os medicamentos e informe IMEDIATAMENTE se temos em estoque e qual o preço.\n3. Se um produto não estiver no inventário, informe que pode verificar a encomenda com um farmacêutico humano.\n\n${inventoryBlock}${examplesBlock}`;

    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      systemInstruction: fullSystemInstruction,
      generationConfig: {
        temperature: temperature ?? 0.7,
        maxOutputTokens: maxTokens ?? 2048,
      },
    });

    let result;
    if (imageBase64) {
      result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { data: imageBase64, mimeType: imageMimeType || "image/jpeg" } },
            { text: prompt || "Analise esta imagem." }
          ]
        }]
      });
    } else {
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error('Resposta vazia da IA');

    return NextResponse.json({ response: text, riskLevel, buyIntent });

  } catch (err: any) {
    console.error('[/api/nanda] Error:', err);

    const isQuotaError = err?.message?.includes('RESOURCE_EXHAUSTED') || err?.status === 429;
    
    // Attempt to get a prompt from the request even if it failed early
    let prompt = '';
    try {
      const body = await req.clone().json();
      prompt = body.prompt || '';
    } catch {}

    if (isQuotaError) {
      const fallback = buildFallbackResponse(prompt);
      return NextResponse.json({
        response: fallback,
        warning: 'Cota da API Gemini atingida. Usando resposta local.',
      });
    }

    return NextResponse.json({ 
      error: err.message || 'Erro interno na IA',
      details: err,
      response: 'Desculpe, tive um problema técnico ao processar sua solicitação. Pode tentar novamente?' 
    }, { status: 500 });
  }
}
