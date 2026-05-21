'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MoreVertical,
  Paperclip,
  Send,
  CheckCheck,
  Smile,
  Mic,
  Square,
  Trash2,
  Phone,
  Video,
  Bot,
  User,
  ShoppingBag,
  FileText,
  MessageSquare,
  Archive,
  ShieldAlert,
  Inbox,
  X,
  Maximize2,
  ChevronLeft,
  Reply,
  Copy,
  Forward,
  CornerUpLeft
} from 'lucide-react';
import { useStore, Message } from '@/hooks/use-store';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

const generateId = () => `${Date.now()}`;

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function ChatPage() {
  const { state, addMessage, deleteMessage, updateLeadStatus } = useStore();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isNandaThinking, setIsNandaThinking] = useState(false);
  const [nandaInsight, setNandaInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [currentView, setCurrentView] = useState<'active' | 'archived' | 'spam'>('active');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // WhatsApp-style interactions
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [contextMenu, setContextMenu] = useState<{ msgId: string; x: number; y: number } | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const EMOJI_CATEGORIES = [
    { label: '😊 Rostos', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿'] },
    { label: '👋 Gestos', emojis: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤜', '🤛', '✊', '👊', '🤚', '🙏', '✍️', '💅', '🤳', '💪', '🦵', '🦶', '👃', '👂', '🦻'] },
    { label: '❤️ Símbolos', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☯️', '✡️', '🔯', '🕎', '☸️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🔕'] },
    { label: '🌿 Natureza', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🌱', '🌿', '☘️', '🍀', '🌸', '🌺', '🌻', '🌹', '🥀', '🌷', '🌳', '🌴', '🌵', '🍁', '🍂', '🍃', '🍄', '🌾', '💐', '🌊', '🌈', '⛅', '🔥', '🌟', '⭐', '✨', '💫', '🌙', '🌞', '🌝', '🌛', '🌜', '🌚'] },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const formatRecordingTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    if (!activeChat?.id) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Seu navegador não suporta gravação de áudio.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const types = ['audio/webm', 'audio/mp4', 'audio/ogg'];
      let options: MediaRecorderOptions = {};
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          options = { mimeType: type };
          break;
        }
      }
      const recorder = new MediaRecorder(stream, options);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: options.mimeType || 'audio/mp4' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err: any) {
      console.log('[audio] mic error:', err.message || err.name);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        alert('Nenhum microfone encontrado neste dispositivo.');
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert('Permissão para acessar o microfone foi negada.');
      } else {
        alert('Erro ao acessar o microfone.');
      }
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleCancelRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setAudioBlob(null);
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
  };

  const handleSendAudio = () => {
    if (!audioBlob || !activeChat?.id) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      addMessage(activeChat.id, {
        id: generateId(),
        senderId: 'admin',
        text: '🎤 Áudio',
        timestamp: new Date().toISOString(),
        type: 'audio',
        data: dataUrl,
      });
      setAudioBlob(null);
      if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
    };
    reader.readAsDataURL(audioBlob);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      setContextMenu(null);
      setShowReactions(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // WhatsApp-style handlers
  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent, msgId: string) => {
    e.preventDefault();
    const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const y = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    setContextMenu({ msgId, x, y });
    setShowReactions(null);
  };

  const handleReply = (msg: Message) => {
    setReplyingTo(msg);
    setContextMenu(null);
    inputRef.current?.focus();
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setContextMenu(null);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleDeleteMsg = (msgId: string) => {
    if (activeChat?.id) {
      deleteMessage(activeChat.id, msgId);
    }
    setContextMenu(null);
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setReactions(prev => ({ ...prev, [msgId]: prev[msgId] === emoji ? '' : emoji }));
    setShowReactions(null);
    setContextMenu(null);
  };

  const filteredChats = state.chats.filter(c => c.status === currentView);
  // Do NOT auto-select first chat — this breaks mobile show/hide panel logic
  const activeChat = activeChatId ? state.chats.find(c => c.id === activeChatId) ?? null : null;
  const activeClient = state.leads.find(l => l.id === activeChat?.clientId);

  // Find the last image in the conversation
  const lastPrescription = activeChat?.messages.filter(m => m.type === 'image').slice(-1)[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const targetChatId = activeChat?.id;
    if (!inputText.trim() || !targetChatId) return;

    const messageId = generateId();
    const userMessage: Message = {
      id: messageId,
      senderId: 'admin',
      text: inputText,
      timestamp: new Date().toISOString(),
      type: 'text',
      replyToId: replyingTo?.id,
    };

    addMessage(targetChatId, userMessage);
    const promptToTrigger = inputText;
    setInputText('');
    setReplyingTo(null);

    if (promptToTrigger.toLowerCase().includes('nanda') || promptToTrigger.length > 5) {
      await handleNandaTrigger(promptToTrigger, targetChatId);
    }
  };

  const handleNandaTrigger = async (userPrompt: string, targetChatId: string) => {
    setIsNandaThinking(true);
    try {
      const res = await fetch('/api/nanda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          trainingExamples: state.trainingExamples,
          products: state.products.slice(0, 20),
        }),
      });
      const data = await res.json();
      const nandaMessage: Message = {
        id: generateId(),
        senderId: 'nanda',
        text: data.response || 'Não consegui processar agora.',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      addMessage(targetChatId, nandaMessage);
    } catch (e) {
      console.error('[chat/nanda]', e);
    } finally {
      setIsNandaThinking(false);
    }
  };

  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat?.id) return;
    e.target.value = '';

    setIsUploadingFile(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type || 'image/jpeg';
      const isPDF = mimeType === 'application/pdf';

      // Add image or file message to UI immediately
      addMessage(activeChat.id, {
        id: generateId(),
        senderId: 'admin',
        text: file.name,
        timestamp: new Date().toISOString(),
        type: isPDF ? 'file' : 'image',
        data: dataUrl,
      });

      try {
        const res = await fetch('/api/nanda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Analise esta receita médica. Liste cada medicamento, dosagem e instrução de uso. IMPORTANTE: Verifique no inventário fornecido se temos esses medicamentos disponíveis. Para cada item encontrado no estoque, informe o preço e confirme que temos para pronta entrega. Ao final, alerte sobre a necessidade de validação pelo farmacêutico.',
            imageBase64: base64,
            imageMimeType: mimeType,
            trainingExamples: state.trainingExamples.slice(0, 5),
            products: state.products.slice(0, 50),
          }),
        });
        const data = await res.json();
        addMessage(activeChat.id, {
          id: generateId(),
          senderId: 'nanda',
          text: data.response || 'Não consegui ler a receita. Tente uma foto mais nítida.',
          timestamp: new Date().toISOString(),
          type: 'text',
        });
      } catch {
        addMessage(activeChat.id, {
          id: generateId(),
          senderId: 'nanda',
          text: 'Erro ao analisar a receita. Tente novamente.',
          timestamp: new Date().toISOString(),
          type: 'text',
        });
      } finally {
        setIsUploadingFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const generateLocalInsight = (messages: Message[], clientName: string) => {
    const texts = messages.map(m => m.text.toLowerCase()).join(' ');
    const buySignals = ['preço', 'quanto', 'comprar', 'quero', 'preciso', 'tem', 'disponível', 'valor', 'pedido'].filter(k => texts.includes(k));
    const healthSignals = ['dor', 'febre', 'remédio', 'receita', 'sintoma', 'medicamento', 'pressão', 'diabetes'].filter(k => texts.includes(k));
    const urgencySignals = ['urgente', 'hoje', 'agora', 'rápido', 'preciso muito', 'emergência'].filter(k => texts.includes(k));
    const parts: string[] = [];
    if (urgencySignals.length > 0) parts.push(`⚡ ${clientName || 'Cliente'} demonstrou urgência.`);
    if (healthSignals.length > 0) parts.push(`💊 Interesse em: ${healthSignals.slice(0, 2).join(', ')}.`);
    if (buySignals.length >= 2) parts.push(`🔥 Alta intenção de compra.`);
    return parts.length > 0 ? parts.join('\n') : `Aguardando interações para análise.`;
  };

  const handleNandaInsight = async () => {
    if (!activeChat) return;
    setIsInsightLoading(true);
    setNandaInsight(null);
    const clientName = activeClient?.name || 'Cliente';
    try {
      const history = activeChat.messages.slice(-6).map(m => `${m.senderId === 'admin' ? 'Atendente' : 'Cliente'}: ${m.text}`).join('\n');
      const res = await fetch('/api/nanda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analise a intenção do cliente ${clientName}. Conversa:\n${history}`,
          trainingExamples: state.trainingExamples.slice(0, 5),
          products: state.products.slice(0, 10),
        }),
      });
      const data = await res.json();
      setNandaInsight(data.response || generateLocalInsight(activeChat.messages, clientName));
    } catch {
      setNandaInsight(generateLocalInsight(activeChat.messages, clientName));
    } finally { setIsInsightLoading(false); }
  };

  return (
    <div className="flex h-[calc(100dvh-8rem)] md:h-[calc(100vh-12rem)] bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-2xl shadow-blue-500/5">
      {/* ImageViewer Modal */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/90 backdrop-blur-md"
            onClick={() => setViewingImage(null)}
          >
            <button className="absolute top-8 right-8 text-white hover:scale-110 transition-transform"><X className="w-10 h-10" /></button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full max-w-5xl max-h-screen flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <img src={viewingImage} alt="Preview" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chats List */}
      <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-96 border-r border-slate-100 flex-col bg-slate-50/30 shrink-0 min-h-0`}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 italic">Caixa de Entrada</h2>
          <div className="flex gap-2 mb-6">
            <button onClick={() => { setCurrentView('active'); setActiveChatId(null); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${currentView === 'active' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400'}`}><Inbox className="w-3 h-3" /> Principal</button>
            <button onClick={() => { setCurrentView('archived'); setActiveChatId(null); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${currentView === 'archived' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400'}`}><Archive className="w-3 h-3" /> Arquivados</button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Pesquisar..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm shadow-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => {
            const client = state.leads.find(l => l.id === chat.clientId);
            const isActive = chat.id === activeChat?.id;
            return (
              <button key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`w-full flex items-center gap-4 p-6 transition-all border-b border-slate-50 ${isActive ? 'bg-white border-l-4 border-l-brand-blue' : ''}`}>
                <div className="relative w-14 h-14">
                  <Image src="/avatar-default.svg" alt="Avatar" fill className="rounded-2xl" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`font-bold truncate ${isActive ? 'text-brand-blue' : 'text-slate-900'}`}>{client?.name}</p>
                    <span className="text-[10px] text-slate-400">14:20</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {activeChat ? (
        <div className={`${activeChatId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white w-full max-w-full overflow-hidden min-h-0`}>
          <div className="p-4 md:p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setActiveChatId(null)}
                className="md:hidden w-10 h-10 flex shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-slate-100 relative"><Image src="/avatar-default.svg" alt="Avatar" fill className="object-cover" /></div>
              <div>
                <p className="font-bold text-slate-900">{activeClient?.name}</p>
                <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><p className="text-xs font-bold text-slate-400 uppercase">Online</p></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600"><Phone className="w-5 h-5" /></button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600"><Video className="w-5 h-5" /></button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-90 min-h-0">
            {activeChat.messages.map((msg) => {
              const isMe = msg.senderId === 'admin';
              const isAI = msg.senderId === 'nanda';
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-3xl relative ${isMe ? 'bg-brand-blue text-white rounded-tr-none' : isAI ? 'bg-slate-900 text-white rounded-tl-none border-t-2 border-blue-400' : 'bg-slate-100'}`}>
                    {isAI && <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold text-[10px] uppercase"><Bot className="w-3 h-3" /> Nanda AI</div>}

                    {msg.type === 'audio' && msg.data ? (
                      <audio controls src={msg.data} className="w-full max-w-[220px] h-8" />
                    ) : msg.type === 'image' && msg.data ? (
                      <div className="relative group cursor-pointer" onClick={() => setViewingImage(msg.data || null)}>
                        <img src={msg.data} alt="Prescription" className="w-64 h-64 object-cover rounded-2xl border-4 border-white/10" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white font-bold gap-2">
                          <Maximize2 className="w-5 h-5" /> Ampliar
                        </div>
                      </div>
                    ) : msg.type === 'file' && msg.data ? (
                      <div className={`flex items-center gap-3 p-4 rounded-2xl min-w-[260px] border ${isMe || isAI
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-slate-200/50 border-slate-300/40 text-slate-800'
                        }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMe || isAI ? 'bg-red-500/20 text-red-300' : 'bg-red-500/10 text-red-500'
                          }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{msg.text}</p>
                          <span className={`text-[9px] font-bold uppercase ${isMe || isAI ? 'opacity-60' : 'text-slate-400'}`}>Receita em PDF</span>
                        </div>
                        <a
                          href={msg.data}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-xl transition-colors shrink-0 ${isMe || isAI ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-200 text-slate-600'
                            }`}
                        >
                          <Maximize2 className="w-4 h-4" />
                        </a>
                      </div>
                    ) : (
                      <div className="text-sm font-medium leading-relaxed markdown-content">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}

                    <div className={`text-[10px] mt-2 flex items-center gap-1 uppercase font-bold ${isMe || isAI ? 'text-white/50' : 'text-slate-400'}`}>
                      {isClient ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      {isMe && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </motion.div>
              )
            })}
            {isNandaThinking && (
              <div className="flex justify-start">
                <div className="bg-slate-900 text-blue-300 p-4 rounded-3xl rounded-tl-none flex items-center gap-2 animate-pulse">
                  <Bot className="w-4 h-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Nanda está analisando...</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 md:p-6 border-t border-slate-50 flex items-center gap-2 md:gap-4 bg-slate-50/50 safe-area-bottom">
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handlePrescriptionUpload} />
            
            {!(isRecording || audioUrl) && (
              <>
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-slate-400 hover:text-brand-blue"><Smile className="w-6 h-6" /></button>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingFile} className="text-slate-400 hover:text-brand-blue"><Paperclip className="w-6 h-6" /></button>
              </>
            )}

            {audioUrl ? (
              <div className="flex-1 flex items-center gap-2 md:gap-4 bg-white border border-slate-100 rounded-full px-2 py-1 shadow-sm">
                <button type="button" onClick={handleCancelRecording} className="w-10 h-10 flex items-center justify-center shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-5 h-5" /></button>
                <audio src={audioUrl} controls className="flex-1 h-10 min-w-0" />
                <button type="button" onClick={handleSendAudio} className="w-10 h-10 shrink-0 bg-brand-blue text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"><Send className="w-4 h-4 ml-1" /></button>
              </div>
            ) : isRecording ? (
              <div className="flex-1 flex items-center justify-between bg-red-50/50 border border-red-100 rounded-full px-6 py-2 shadow-sm">
                <button type="button" onClick={handleCancelRecording} className="text-slate-400 hover:text-red-500 transition-colors p-2"><Trash2 className="w-5 h-5" /></button>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-500 font-bold text-sm">{formatRecordingTime(recordingSeconds)}</span>
                </div>
                <div className="w-9" /> {/* Spacer para centralizar o timer visualmente */}
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex-1 relative">
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} type="text" placeholder="Digite sua mensagem..." className="w-full py-4 px-6 bg-white border border-slate-100 rounded-full text-sm focus:ring-4 focus:ring-brand-blue/10 pr-14 shadow-sm" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center"><Send className="w-4 h-4 ml-1" /></button>
              </form>
            )}
            
            {!audioUrl && (
              <button onClick={isRecording ? handleStopRecording : handleStartRecording} className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-blue text-white hover:bg-blue-600 shadow-md'}`}>
                {isRecording ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 mb-6 border border-slate-100"><MessageSquare className="w-10 h-10" /></div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Selecione uma conversa</h3>
        </div>
      )}

      {activeChat && (
        <div className="hidden lg:flex w-80 border-l border-slate-50 flex-col bg-slate-50/30 shrink-0">
          <div className="p-8 text-center bg-white border-b border-slate-50 mb-6">
            <div className="w-24 h-24 rounded-[32px] mx-auto mb-4 border-4 border-slate-50 overflow-hidden relative"><Image src="/avatar-default.svg" alt="Avatar" fill className="object-cover" /></div>
            <h3 className="font-bold text-lg text-slate-900">{activeClient?.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Lead em Negociação</p>
          </div>
          <div className="flex-1 px-6 space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase pl-2">Ações Rápidas</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl hover:bg-brand-blue hover:text-white transition-all">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Novo Pedido</span>
                </button>
                <button
                  onClick={() => lastPrescription?.data && setViewingImage(lastPrescription.data)}
                  disabled={!lastPrescription}
                  className={`flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl transition-all ${lastPrescription ? 'hover:bg-brand-red hover:text-white cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                >
                  <FileText className={`w-5 h-5 ${lastPrescription ? 'text-brand-red group-hover:text-white' : 'text-slate-300'}`} />
                  <span className="text-[10px] font-bold">{lastPrescription ? 'Ver Receita' : 'Sem Receita'}</span>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase pl-2">IA Insight</p>
              <div className="bg-slate-900 p-5 rounded-3xl text-white space-y-3">
                <p className="text-[11px] font-bold text-blue-300 uppercase italic">Resumo da Nanda</p>
                {isInsightLoading ? <p className="text-xs">Analisando...</p> : <p className="text-xs text-slate-300">{nandaInsight || 'Sem análise.'}</p>}
                <button onClick={handleNandaInsight} className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-blue rounded-xl text-[10px] font-bold transition-all"><Bot className="w-3 h-3" /> Consultar Nanda</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

