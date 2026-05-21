'use client';

import { motion, Reorder, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  MessageSquare, 
  Calendar,
  Tag as TagIcon,
  ChevronDown,
  GripVertical,
  X,
  CheckCircle2,
  Check,
  Clock,
  User as UserIcon,
  Type,
  AlignLeft,
  Edit,
  Trash2,
  Mail,
  Bot,
  Sparkles,
  BarChart2,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { useStore, Lead, Task } from '@/hooks/use-store';
import Image from 'next/image';
import { toast } from 'sonner';
import { 
  FunnelChart, 
  Funnel, 
  LabelList, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const columns: { id: Lead['status']; label: string; color: string; hex: string }[] = [
  { id: 'new', label: 'Novo Lead', color: 'bg-blue-500', hex: '#3b82f6' },
  { id: 'attending', label: 'Em Atendimento', color: 'bg-brand-red', hex: '#de1d30' },
  { id: 'negotiating', label: 'Negociação', color: 'bg-orange-500', hex: '#f97316' },
  { id: 'closed', label: 'Venda Concluída', color: 'bg-green-600', hex: '#16a34a' },
  { id: 'lost', label: 'Perdido', color: 'bg-slate-400', hex: '#94a3b8' },
];

export default function CRMPage() {
  const { state, addLead, updateLeadStatus, addTagToLead, removeTagFromLead, addTask, updateLead, deleteLead } = useStore();
  const [showFunnel, setShowFunnel] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Funnel Data Calculation
  const funnelData = columns.map(col => ({
    name: col.label,
    value: state.leads.filter(l => l.status === col.id).length,
    fill: col.hex
  }));
  const [editingTagLeadId, setEditingTagLeadId] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: '',
    phone: '',
    email: '',
    status: 'new',
    tags: []
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    responsible: state.user?.name || ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Lead['status'] | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');

  const allTags = Array.from(new Set(state.leads.flatMap(l => l.tags)));

  const filteredLeads = state.leads.filter(lead => {
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = (
      lead.name.toLowerCase().includes(searchLow) ||
      lead.phone.toLowerCase().includes(searchLow) ||
      lead.tags.some(tag => tag.toLowerCase().includes(searchLow))
    );
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    const matchesTag = selectedTag === 'all' || lead.tags.includes(selectedTag);

    return matchesSearch && matchesStatus && matchesTag;
  });

  const getLeadsByStatus = (status: Lead['status']) => 
    filteredLeads.filter(l => l.status === status);

  const handleAddTag = (leadId: string) => {
    if (newTagValue.trim()) {
      addTagToLead(leadId, newTagValue.trim());
      setNewTagValue('');
      setEditingTagLeadId(null);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.responsible) return;

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...newTask,
      status: 'pending'
    };

    addTask(task);
    setNewTask({ title: '', description: '', dueDate: '', responsible: '' });
    setIsTaskModalOpen(false);
    toast.success('Tarefa criada com sucesso!');
  };

  const handleEditLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLead) {
      updateLead(selectedLead as Lead);
      setIsEditModalOpen(false);
      setSelectedLead(null);
      toast.success('Lead atualizado com sucesso!');
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) return;

    await addLead({
      name: newLead.name,
      phone: newLead.phone,
      email: newLead.email || '',
      status: 'new',
      tags: [],
      aiInsight: 'Aguardando primeira interação para análise.'
    });

    setNewLead({ name: '', phone: '', email: '', status: 'new', tags: [] });
    setIsNewLeadModalOpen(false);
    toast.success('Lead adicionado com sucesso!');
  };

  const handleDeleteLead = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id);
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
      toast.success('Lead excluído com sucesso!');
    }
  };

  const handleContactLead = (leadId: string) => {
    addTagToLead(leadId, 'Contatado');
    const currentIndex = state.leads.findIndex(l => l.id === leadId);
    const nextLead = state.leads[currentIndex + 1];
    if (nextLead) {
      updateLeadStatus(nextLead.id, 'new');
    }
  };

  return (
    <div className="space-y-8 flex flex-col h-full relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight italic">Pipeline de Vendas</h1>
          <p className="text-slate-500 font-medium">Gerencie seus contatos e leads vindos do WhatsApp.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowFunnel(!showFunnel)}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              showFunnel 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            {showFunnel ? 'Ocultar Funil' : 'Ver Funil'}
          </button>
          <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-blue/20 focus-within:border-brand-blue transition-all">
             <Search className="w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Buscar lead ou tag..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-transparent border-0 focus:ring-0 text-sm font-medium outline-none w-48 lg:w-32" 
             />
          </div>
          <button 
            onClick={() => setSelectedStatus(selectedStatus === 'closed' ? 'all' : 'closed')}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              selectedStatus === 'closed'
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' 
                : 'bg-white text-green-600 border border-green-200 hover:bg-green-50 shadow-sm'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${selectedStatus === 'closed' ? 'text-white' : 'text-green-500'}`} />
            Vendas
          </button>
          <button 
            onClick={() => setIsNewLeadModalOpen(true)}
            className="bg-brand-blue text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-lg hover:bg-blue-600 transition-all font-display italic tracking-wide"
          >
            <Plus className="w-4 h-4" /> Novo Lead
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFunnel && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight italic">Status do Funil</h2>
                </div>
                <p className="text-slate-500 text-sm font-medium">Visualização em tempo real das etapas de conversão dos seus leads.</p>
                
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
                  {funnelData.map((stage) => (
                    <div key={stage.name} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-brand-blue/30 transition-all">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{stage.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-display font-bold text-slate-900 italic tracking-tighter">{stage.value}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Leads</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-[400px] h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '20px', 
                        border: 'none', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        padding: '12px 18px',
                        fontWeight: 'bold'
                      }} 
                    />
                    <Funnel
                      data={funnelData}
                      dataKey="value"
                      stroke="none"
                    >
                      <LabelList 
                        position="right" 
                        fill="#64748b" 
                        stroke="none" 
                        dataKey="name" 
                        style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} 
                      />
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8 - (index * 0.1)} />
                      ))}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-2 mr-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtros:</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedStatus === 'all' 
                ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/20' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos Status
          </button>
          {columns.map(col => (
            <button 
              key={col.id}
              onClick={() => setSelectedStatus(col.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === col.id 
                  ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-2" />

        <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedTag === 'all' 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todas Tags
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedTag === tag 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
        {columns.map((column) => (
          <div 
            key={column.id} 
            className="flex-shrink-0 w-[380px] min-w-[380px] bg-slate-100/50 rounded-[32px] p-4 flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedItem) updateLeadStatus(draggedItem, column.id);
              setDraggedItem(null);
            }}
          >
            <div className="flex items-center justify-between mb-6 px-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{column.label}</h3>
                <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-400 border border-slate-200">
                  {getLeadsByStatus(column.id).length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {getLeadsByStatus(column.id).map((lead) => (
                <motion.div 
                  key={lead.id}
                  layoutId={lead.id}
                  draggable
                  onDragStart={() => setDraggedItem(lead.id)}
                  onDragEnd={() => setDraggedItem(null)}
                  className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg cursor-grab active:cursor-grabbing transition-all group relative ${
                    draggedItem === lead.id 
                      ? 'opacity-50 blur-[2px] scale-[0.98] rotate-1 shadow-2xl z-50 ring-2 ring-brand-blue/20' 
                      : 'opacity-100 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col">
                      <h4 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{lead.name}</h4>
                      {lead.aiInsight && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-blue/5 border border-brand-blue/10 rounded-full">
                            <Sparkles className="w-2 h-2 text-brand-blue" />
                            <span className="text-[9px] font-bold text-brand-blue uppercase tracking-tighter">Insight Nanda Cloud IA</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 italic flex-1 leading-tight" title={lead.aiInsight}>
                            &quot;{lead.aiInsight}&quot;
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleContactLead(lead.id); }}
                        className="p-1.5 hover:bg-green-50 rounded-lg text-slate-400 hover:text-green-500 transition-all"
                        title="Marcar como Contatado"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setIsEditModalOpen(true); }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-blue transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setLeadToDelete(lead); setIsDeleteModalOpen(true); }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <GripVertical className="w-4 h-4 text-slate-300 ml-1" />
                    </div>
                  </div>
                  
                  <p className="text-xs font-medium text-slate-500 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> {lead.phone}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {lead.tags.map((tag) => (
                      <span 
                        key={tag} 
                        onClick={() => removeTagFromLead(lead.id, tag)}
                        className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        {tag}
                        <X className="w-2 h-2" />
                      </span>
                    ))}
                    
                    {editingTagLeadId === lead.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-1">
                        <input
                          autoFocus
                          type="text"
                          value={newTagValue}
                          onChange={(e) => setNewTagValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTag(lead.id);
                            if (e.key === 'Escape') setEditingTagLeadId(null);
                          }}
                          onBlur={() => handleAddTag(lead.id)}
                          placeholder="Nova tag..."
                          className="w-20 px-2 py-0.5 bg-white border border-brand-blue rounded-md text-[10px] font-bold outline-none"
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => setEditingTagLeadId(lead.id)}
                        className="text-slate-300 hover:text-brand-blue border border-dashed border-slate-200 p-1 rounded-md transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative">
                        <Image 
                          src="/avatar-default.svg"
                          alt={lead.name}
                          fill
                        />
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                      <Calendar className="w-3 h-3" /> 2d atrás
                    </div>
                  </div>
                </motion.div>
              ))}

              <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold hover:bg-white hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar Lead
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">Criar Nova Tarefa</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Defina prazos e responsáveis</p>
                </div>
                <button 
                  onClick={() => setIsTaskModalOpen(false)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Título da Tarefa</label>
                    <div className="relative">
                      <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="Ex: Ligar para cliente João"
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Descrição</label>
                    <div className="relative">
                      <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                      <textarea 
                        rows={3}
                        placeholder="Detalhes sobre a tarefa..."
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-medium text-slate-600 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Prazo</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-medium text-slate-600 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Responsável</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                          value={newTask.responsible}
                          onChange={(e) => setNewTask({...newTask, responsible: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-medium text-slate-600 transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Selecione...</option>
                          <option value="Admin Drogaria">Admin Drogaria</option>
                          <option value="Ricardo Dias">Ricardo Dias</option>
                          <option value="Nanda AI">Nanda AI</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Criar Tarefa
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isNewLeadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewLeadModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">Novo Lead</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Adicione um novo contato ao pipeline</p>
                </div>
                <button 
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nome Completo</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="Nome do cliente"
                        value={newLead.name}
                        onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Telefone WhatsApp</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="(00) 00000-0000"
                        value={newLead.phone}
                        onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="email" 
                        placeholder="email@exemplo.com"
                        value={newLead.email}
                        onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsNewLeadModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Adicionar Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isEditModalOpen && selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsEditModalOpen(false); setSelectedLead(null); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">Editar Lead</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Atualize as informações do contato</p>
                </div>
                <button 
                  onClick={() => { setIsEditModalOpen(false); setSelectedLead(null); }}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditLead} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nome Completo</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        value={selectedLead.name}
                        onChange={(e) => setSelectedLead({...selectedLead, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Telefone WhatsApp</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        value={selectedLead.phone}
                        onChange={(e) => setSelectedLead({...selectedLead, phone: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="email" 
                        value={selectedLead.email}
                        onChange={(e) => setSelectedLead({...selectedLead, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Insight da IA (Nanda Cloud)</label>
                    <div className="relative">
                      <Sparkles className="absolute left-4 top-4 w-4 h-4 text-brand-blue" />
                      <textarea 
                        rows={2}
                        value={selectedLead.aiInsight || ''}
                        onChange={(e) => setSelectedLead({...selectedLead, aiInsight: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-medium text-slate-700 transition-all resize-none italic"
                        placeholder="Análise automática da Nanda..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => { setIsEditModalOpen(false); setSelectedLead(null); }}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && leadToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsDeleteModalOpen(false); setLeadToDelete(null); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 italic">Excluir Lead?</h3>
              <p className="text-sm font-medium text-slate-500 mb-8 px-4">
                Você está prestes a remover <span className="font-bold text-slate-900">{leadToDelete.name}</span> do seu pipeline. Esta ação não pode ser desfeita.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteLead}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all active:scale-95"
                >
                  Sim, Excluir Lead
                </button>
                <button 
                  onClick={() => { setIsDeleteModalOpen(false); setLeadToDelete(null); }}
                  className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
