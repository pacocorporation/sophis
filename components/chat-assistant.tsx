'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  Paperclip,
  Stethoscope,
  Pill,
  Search,
  FileText
} from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'file';
  data?: string;
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
const [isDragging, setIsDragging] = useState(false);
const startXRef = useRef(0);
const startYRef = useRef(0);
const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Eu sou a Nanda, assistente virtual da Drogaria Max. Posso te ajudar agora mesmo com: Consultar preços e promoções, Verificar estoque em tempo real,  Interpretar sua receita (é só enviar a foto!),  Fazer seu pedido com entrega rápida',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
const dragRef = useRef<HTMLDivElement>(null);
  const { state } = useStore();

useEffect(() => {
  const initX = window.innerWidth - 80;
  const initY = window.innerHeight - 80;
  setPos({ x: initX, y: initY });
}, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const callNanda = async (prompt: string, imageBase64?: string, imageMimeType?: string) => {
    const res = await fetch('/api/nanda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        imageBase64,
        imageMimeType,
        trainingExamples: state.trainingExamples,
        products: state.products.slice(0, 20),
      }),
    });
    const data = await res.json();
    if (data.warning) console.warn('[Nanda quota]', data.warning);
    if (!res.ok && !data.response) throw new Error(data.error || 'Erro na API');
    return data.response as string;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type || 'image/jpeg';
      const isPDF = mimeType === 'application/pdf';

      const userMessage: Message = {
        role: 'user',
        content: file.name,
        timestamp: new Date(),
        type: isPDF ? 'file' : 'image',
        data: dataUrl
      };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await callNanda(
          "Analise esta receita médica. Identifique os medicamentos, dosagens e instruções de uso. Verifique se temos esses itens no estoque e informe o preço.",
          base64,
          mimeType
        );
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response || "Recebi o documento, mas tive dificuldade em ler os detalhes. Certifique-se de que o documento está nítido.",
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error("Prescription error:", error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Desculpe, não consegui analisar o documento agora. Tente novamente em instantes.',
          timestamp: new Date()
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyContext = `Histórico recente:\n${messages.slice(-4).map(m => `${m.role === 'user' ? 'Cliente' : 'Nanda'}: ${m.content}`).join('\n')}`;
      const response = await callNanda(`${historyContext}\n\nCliente: ${input}`);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response || 'Desculpe, não consegui processar sua solicitação agora.',
        timestamp: new Date()
      }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Estou com instabilidade no momento. Por favor, tente novamente em instantes! 🙏',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

const handleMouseDown = (e: React.MouseEvent) => {
  e.preventDefault();
  setIsDragging(true);
  startXRef.current = e.clientX;
  startYRef.current = e.clientY;
  startPosRef.current = { ...pos };
};

useEffect(() => {
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;
    setPos({ x: startPosRef.current.x + dx, y: startPosRef.current.y + dy });
  };
  const onMouseUp = () => {
    setIsDragging(false);
  };
  if (isDragging) {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
  return () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };
}, [isDragging]);

  return (
    <div
  ref={dragRef}
  onMouseDown={handleMouseDown}
  style={{
    position: 'fixed',
    left: pos.x,
    top: pos.y,
    zIndex: 100,
    cursor: isDragging ? 'grabbing' : 'grab'
  }}
  className="flex flex-col items-end"
>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '64px' : '600px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col mb-4 origin-bottom-right"
          >
            {/* Header */}
            <header className="p-4 bg-brand-blue text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Nanda IA</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {!isMinimized && (
              <>
                {/* Messages Panel */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/50"
                >
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                          msg.role === 'user' 
                          ? 'bg-white border-slate-200 text-slate-400' 
                          : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                        }`}>
                          {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                          ? 'bg-brand-blue text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                        }`}>
                          {msg.type === 'image' && msg.data ? (
                            <div className="space-y-2 max-w-[200px]">
                              <img src={msg.data} alt="Prescription" className="w-full h-auto rounded-lg border border-white/20 shadow-sm" />
                              <p className="text-xs opacity-90">{msg.content}</p>
                            </div>
                          ) : msg.type === 'file' && msg.data ? (
                            <div className={`flex items-center gap-3 p-3 rounded-2xl min-w-[200px] border ${
                              msg.role === 'user'
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-slate-50 border-slate-200/60 text-slate-800'
                            }`}>
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                msg.role === 'user' ? 'bg-red-500/20 text-red-300' : 'bg-red-500/10 text-red-500'
                              }`}>
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold truncate">{msg.content}</p>
                                <span className={`text-[8px] font-bold uppercase ${msg.role === 'user' ? 'opacity-60' : 'text-slate-400'}`}>Receita em PDF</span>
                              </div>
                              <a 
                                href={msg.data} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                                  msg.role === 'user' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-600'
                                }`}
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <div className="markdown-content">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                          <p className={`text-[9px] mt-2 font-bold opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-2 items-center">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nanda está pensando</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                <div className="px-6 py-3 bg-white border-t border-slate-100 overflow-x-auto flex gap-2 no-scrollbar">
                  {[
                    { icon: <Pill className="w-3 h-3" />, label: 'Preço Paracetamol' },
                    { icon: <Stethoscope className="w-3 h-3" />, label: 'Interpretar Receita' },
                    { icon: <Search className="w-3 h-3" />, label: 'Dúvida Técnica' }
                  ].map((s, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setInput(s.label)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold flex items-center gap-2 whitespace-nowrap transition-all border border-slate-100 shadow-sm"
                    >
                      {s.icon}
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <footer className="p-4 bg-white border-t border-slate-100">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-brand-blue/20 focus-within:border-brand-blue transition-all">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden" 
                      accept="image/*,application/pdf"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-slate-400 hover:text-brand-blue transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Pergunte qualquer coisa..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium h-10 py-2 resize-none no-scrollbar placeholder:text-slate-400"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </footer>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isOpen ? 'bg-white text-slate-800' : 'bg-brand-blue text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <Minimize2 className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageSquare className="w-7 h-7" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red rounded-full border-2 border-brand-blue flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white fill-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
