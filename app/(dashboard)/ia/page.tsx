'use client';

import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Zap, 
  Search, 
  FileText, 
  Sparkles, 
  MessageCircle, 
  ShieldAlert,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Upload,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { useStore } from '@/hooks/use-store';

export default function IAPage() {
  const [config, setConfig] = useState({
    temperature: 0.7,
    maxTokens: 1024,
    systemPrompt: "Você é Nanda, assistente inteligente da Nanda Cloud. Especialista em atendimento farmacêutico e vendas. Seja cordial, persuasiva e humana. IMPORTANTE: Para queixas de saúde, sempre recomende a consulta com um profissional médico ou farmacêutico antes de sugerir produtos para alívio de sintomas. Ofereça opções de alívio imediato (como pastilhas ou sprays) caso existam no estoque, mas nunca realize diagnósticos."
  });

  const { state, setProducts, addTrainingExample, removeTrainingExample } = useStore();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [inventoryCount, setInventoryCount] = useState<number | null>(null);
  const [newExample, setNewExample] = useState({ question: '', answer: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [simulatedInput, setSimulatedInput] = useState("Minha garganta está doendo muito, o que você recomenda?");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);
  const [simulatedRisk, setSimulatedRisk] = useState<string>('—');
  const [simulatedIntent, setSimulatedIntent] = useState<string>('—');
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const callNandaAPI = async (payload: object) => {
    const res = await fetch('/api/nanda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro na API');
    }
    return res.json();
  };

  const handleUpdateEngine = async () => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      // Persist config by doing a test call — real save would go to Supabase
      await callNandaAPI({
        prompt: 'Ping de configuração. Responda apenas: OK.',
        systemPrompt: config.systemPrompt,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        trainingExamples: state.trainingExamples,
        products: state.products,
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (e: any) {
      setApiError(e.message);
      setTimeout(() => setApiError(null), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSimulate = async () => {
    if (!simulatedInput.trim()) return;
    setIsSimulating(true);
    setSimulatedResponse(null);
    setApiError(null);
    try {
      const data = await callNandaAPI({
        prompt: simulatedInput,
        systemPrompt: config.systemPrompt,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        trainingExamples: state.trainingExamples,
        products: state.products,
      });
      setSimulatedResponse(data.response);
      setSimulatedRisk(data.riskLevel || 'Baixo Risco');
      setSimulatedIntent(data.buyIntent || '—');
      setApiWarning(data.warning || null);
    } catch (e: any) {
      setApiError(e.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredExamples = state.trainingExamples.filter(ex => 
    ex.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ex.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExamples.length / ITEMS_PER_PAGE);
  const paginatedExamples = filteredExamples.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddExample = () => {
    if (!newExample.question.trim() || !newExample.answer.trim()) return;
    
    addTrainingExample({
      id: Math.random().toString(36).slice(2, 11),
      question: newExample.question.trim(),
      answer: newExample.answer.trim(),
      createdAt: new Date().toISOString()
    });
    
    setNewExample({ question: '', answer: '' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        
        // 1. Column Presence Validation
        const hasNome = headers.some(h => ['Nome', 'Produto', 'Name', 'name'].includes(h));
        const hasPreco = headers.some(h => ['Preço', 'Preco', 'Price', 'price'].includes(h));
        const hasEstoque = headers.some(h => ['Estoque', 'Stock', 'estoque'].includes(h));

        if (!hasNome || !hasPreco || !hasEstoque) {
          setTimeout(() => {
            setUploadStatus('idle');
            setUploadError('O arquivo deve conter as colunas obrigatórias: Nome, Preço e Estoque.');
          }, 800);
          return;
        }

        // 2. Data Validation
        const errors: string[] = [];
        const validatedProducts = results.data.map((row: any, i: number) => {
          const name = row.Nome || row.Produto || row.Name || row.name;
          const rawPrice = row.Preço || row.Preco || row.Price || row.price;
          const rawStock = row.Estoque || row.Stock || row.estoque;

          // Replace comma with dot for price parsing
          const price = parseFloat(String(rawPrice).replace(',', '.'));
          const stock = parseInt(String(rawStock));

          if (!name) errors.push(`Linha ${i + 1}: "Nome" ausente.`);
          if (isNaN(price)) errors.push(`Linha ${i + 1}: "Preço" inválido.`);
          if (isNaN(stock)) errors.push(`Linha ${i + 1}: "Estoque" inválido.`);

          return {
            id: `upload-${i}`,
            name,
            price: isNaN(price) ? 0 : price,
            category: row.Categoria || row.Category || 'Geral',
            stock: isNaN(stock) ? 0 : stock
          };
        });

        if (errors.length > 0) {
          setTimeout(() => {
            setUploadStatus('idle');
            setUploadError(`Erros de formatação:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n...e mais ${errors.length - 3} erros.` : ''}`);
          }, 800);
          return;
        }

        setTimeout(() => {
          setProducts(validatedProducts);
          setInventoryCount(validatedProducts.length);
          setUploadStatus('success');
        }, 1500);
      },
      error: () => {
        setUploadStatus('idle');
        setUploadError('Erro ao processar o arquivo. Verifique se o formato está correto.');
      }
    });
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight italic">IA Nanda Central</h1>
          <p className="text-slate-500 font-medium tracking-tight">O cérebro artificial da sua farmácia, treinada para vender.</p>
        </div>
        <div className="py-2 px-4 bg-blue-50 text-brand-blue rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
           <Zap className="w-4 h-4 fill-current" /> Plano Enterprise Ativo
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left: AI Capabilities */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="relative z-10">
               <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 italic">
                 <Bot className="text-brand-blue" /> Visão Geral
               </h2>
               <div className="space-y-6">
                 {[
                   { title: 'Leitura de Receitas (OCR)', desc: 'Nanda identifica medicamentos em fotos de receitas enviadas por clientes.', status: 'Ativo' },
                   { title: 'Sugestão de Cesta', desc: 'Analisa o pedido e sugere produtos complementares (Vitaminas, Higiene).', status: 'Ativo' },
                   { title: 'Resumo de Conversa', desc: 'Gera um sumário executivo de chats longos para o atendente humano.', status: 'Ativo' },
                   { title: 'Detecção de Intenção', desc: 'Separa quem quer comprar de quem só quer tirar dúvidas.', status: 'Ativo' },
                 ].map((cap, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl">
                     <div>
                       <p className="font-bold text-slate-800">{cap.title}</p>
                       <p className="text-xs text-slate-500 font-medium">{cap.desc}</p>
                     </div>
                     <span className="text-[10px] font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full uppercase">{cap.status}</span>
                   </div>
                 ))}
               </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl" />
           </div>

           {/* Configuration Section */}
           <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold italic flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-blue" /> Configurações do Modelo
                </h3>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-2 py-1 rounded-lg border border-white/10 tracking-widest">IA Engine v3.0</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-1">Provider: Gemini 2.0 Flash</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temperatura ({config.temperature})</label>
                      <div className="group relative">
                        <ShieldAlert className="w-3 h-3 text-slate-600 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-white text-slate-900 text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl pointer-events-none z-50">
                          Valores baixos tornam a Nanda mais focada e determinística. Valores altos aumentam a criatividade.
                        </div>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={config.temperature}
                      onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                      <span>Focado</span>
                      <span>Criativo</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Máx Tokens</label>
                      <div className="group relative">
                        <ShieldAlert className="w-3 h-3 text-slate-600 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-white text-slate-900 text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl pointer-events-none z-50">
                          Limita o tamanho máximo da resposta. 1024 tokens equivalem a aprox. 750 palavras.
                        </div>
                      </div>
                    </div>
                    <input 
                      type="number" 
                      value={config.maxTokens}
                      onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-brand-blue focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prompt de Sistema (Persona)</label>
                    <span className="text-[9px] font-bold text-brand-blue uppercase bg-brand-blue/10 px-2 py-0.5 rounded">Recomendado</span>
                  </div>
                  <div className="relative group/prompt">
                    <textarea 
                      value={config.systemPrompt}
                      onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs text-slate-300 leading-relaxed font-mono h-48 focus:ring-2 focus:ring-brand-blue outline-none resize-none transition-all group-hover/prompt:border-white/20"
                      placeholder="Defina o comportamento da Nanda..."
                    />
                    <div className="absolute bottom-4 right-4 opacity-30">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Dica: Descreva a Nanda como se estivesse contratando uma funcionária real.</p>
                </div>
              </div>

              <button 
                onClick={handleUpdateEngine}
                disabled={isUpdating}
                className={`w-full py-4 rounded-[20px] font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 group ${
                  updateSuccess 
                    ? 'bg-green-600 shadow-green-500/20 text-white' 
                    : 'bg-brand-blue hover:bg-blue-600 text-white shadow-brand-blue/20'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Atualizando Cérebro...
                  </>
                ) : updateSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Engine Atualizada
                  </>
                ) : (
                  <>
                    Atualizar Engine IA <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
           </div>
        </div>

        {/* Right: Interactive Demo */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <h3 className="text-lg font-bold mb-8 italic">Simular Comportamento</h3>
             <div className="space-y-6">
                <div className="bg-slate-100 p-4 rounded-2xl">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Entrada (Foto ou Texto)</p>
                   <input 
                    type="text" 
                    value={simulatedInput}
                    onChange={(e) => setSimulatedInput(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium p-0"
                    placeholder="Digite uma pergunta para a Nanda..."
                  />
                </div>
                
                <button 
                  onClick={handleSimulate}
                  disabled={isSimulating || !simulatedInput.trim()}
                  className="w-full py-3 bg-brand-blue/10 text-brand-blue rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all disabled:opacity-50"
                >
                  {isSimulating ? 'Processando...' : 'Testar Resposta'}
                </button>

                <div className="flex justify-center">
                  <div className={`w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center ${isSimulating ? 'animate-bounce' : ''}`}>
                    <Bot className="w-6 h-6" />
                  </div>
                </div>

                <AnimatePresence>
                  {(simulatedResponse || isSimulating) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-brand-blue/5 p-4 rounded-2xl border border-brand-blue/10"
                    >
                       <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-2">Resposta Sugerida pela Nanda</p>
                       {isSimulating ? (
                         <div className="flex gap-1 py-2">
                           <div className="w-1.5 h-1.5 bg-brand-blue/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                           <div className="w-1.5 h-1.5 bg-brand-blue/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                           <div className="w-1.5 h-1.5 bg-brand-blue/40 rounded-full animate-bounce" />
                         </div>
                       ) : (
                         <p className="text-sm font-medium text-slate-700 animate-in fade-in slide-in-from-top-1">&quot;{simulatedResponse}&quot;</p>
                       )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {apiError && (
                   <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-xs font-bold text-red-600">
                     ⚠️ {apiError}
                   </div>
                 )}
                 {apiWarning && (
                   <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-medium text-amber-700 flex items-start gap-2">
                     <span className="text-base leading-none">🔶</span>
                     <span>{apiWarning}</span>
                   </div>
                 )}
                 <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                     <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Análise de Risco</p>
                     <p className="text-xs font-bold italic">{isSimulating ? '...' : simulatedRisk}</p>
                   </div>
                   <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                     <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Intenção de Compra</p>
                     <p className="text-xs font-bold italic">{isSimulating ? '...' : simulatedIntent}</p>
                   </div>
                 </div>

             </div>
           </div>

           <div className="bg-gradient-to-br from-brand-red to-orange-600 p-8 rounded-[40px] text-white overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4 italic flex items-center gap-2">
                  <Upload className="w-5 h-5" /> Treine sua Nanda
                </h3>
                <p className="text-sm text-white/80 mb-8 font-medium">Faça upload do seu arquivo de estoque (.csv) para que a Nanda sugira apenas o que você tem disponível agora.</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv"
                  className="hidden"
                />

                {uploadStatus === 'idle' && (
                  <div className="space-y-4">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-brand-red px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                    >
                      Fazer Upload de Estoque <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    {uploadError && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-start gap-3 border border-white/20 animate-in fade-in slide-in-from-left-2"
                      >
                        <AlertCircle className="w-5 h-5 text-white shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-1">Erro de Validação</p>
                          <p className="text-xs text-white/90 font-medium whitespace-pre-line">{uploadError}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {uploadStatus === 'uploading' && (
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3 border border-white/20">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-bold text-sm">Processando inventário...</span>
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500 rounded-2xl p-4 flex flex-col gap-2 border border-green-400 shadow-lg shadow-black/10"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                      <span className="font-bold text-sm text-white">Nanda Treinada com Sucesso!</span>
                    </div>
                    <p className="text-[10px] font-bold text-green-100 uppercase tracking-widest">
                      {inventoryCount} ITENS SINCRONIZADOS
                    </p>
                    <button 
                      onClick={() => setUploadStatus('idle')}
                      className="mt-2 text-[10px] font-bold text-white/80 hover:text-white underline text-left"
                    >
                      Atualizar novamente
                    </button>
                  </motion.div>
                )}
              </div>
              
              {/* Background accent */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
           </div>

           {/* Fine-Tuning / Training Examples Section */}
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold italic flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-brand-blue" /> Exemplos de Treinamento
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ensine a Nanda como responder corretamente</p>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600">
                  {state.trainingExamples.length} EXEMPLOS
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                    <Search className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    placeholder="Buscar exemplos por pergunta ou resposta..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                  />
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exemplo de Pergunta (Prompt)</label>
                    <textarea 
                      placeholder="Ex: Como faço para devolver um medicamento?"
                      value={newExample.question}
                      onChange={(e) => setNewExample({ ...newExample, question: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand-blue outline-none resize-none transition-all h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resposta Ideal</label>
                    <textarea 
                      placeholder="Ex: Para devoluções, você tem até 7 dias após a compra, desde que a embalagem esteja lacrada..."
                      value={newExample.answer}
                      onChange={(e) => setNewExample({ ...newExample, answer: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand-blue outline-none resize-none transition-all h-24"
                    />
                  </div>
                  <button 
                    onClick={handleAddExample}
                    disabled={!newExample.question.trim() || !newExample.answer.trim()}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Adicionar ao Treinamento
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <AnimatePresence mode="popLayout">
                    {paginatedExamples.map((example) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        key={example.id} 
                        className="group p-5 bg-slate-50 rounded-[32px] border border-transparent hover:border-slate-200 transition-all relative"
                      >
                      <button 
                        onClick={() => removeTrainingExample(example.id)}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="space-y-3 pr-8">
                        <div>
                          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-1">Pergunta</p>
                          <p className="text-sm font-bold text-slate-800">{example.question}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Resposta Esperada</p>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed">{example.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Página {currentPage} de {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-brand-blue hover:border-brand-blue disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-100 transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-brand-blue hover:border-brand-blue disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-100 transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {state.trainingExamples.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-sm text-slate-400 font-medium">Nenhum exemplo adicionado ainda.</p>
                      <p className="text-[10px] text-slate-300 uppercase font-bold tracking-widest mt-1">Comece ensinando novos padrões</p>
                    </div>
                  )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
