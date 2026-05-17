'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  Megaphone, 
  Plus, 
  Mail, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  ArrowRight,
  MoreVertical,
  Calendar,
  Eye,
  MousePointer2,
  Edit,
  Trash2,
  Zap,
  Clock,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { useStore, Campaign } from '@/hooks/use-store';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const data = [
  { name: 'Inativos', value: 45 },
  { name: 'Aniversários', value: 30 },
  { name: 'Vitamina C', value: 85 },
  { name: 'Genéricos', value: 60 },
];



export default function MarketingPage() {
  const { state, addCampaign, updateCampaign: storeUpdateCampaign, deleteCampaign: storeDeleteCampaign, updateFlow } = useStore();
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>([]);
  const automations = state.flows;

  useEffect(() => {
    setLocalCampaigns(state.campaigns);
  }, [state.campaigns]);

  const saveCampaignsOrder = (newOrder: Campaign[]) => {
    setLocalCampaigns(newOrder);
  };

  const [showChannelSelector, setShowChannelSelector] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showReport, setShowReport] = useState<Campaign | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const addCampaignChannel = useCallback(async (type: string) => {
    setIsAdding(true);
    try {
      const newCamp = {
        title: `Nova Campanha ${type}`,
        channel: type,
        status: 'Draft',
        sent: 0,
        converted: 0
      };
      
      const created = await addCampaign(newCamp);
      if (created) {
        setEditingCampaign(created); // Abre o modal automaticamente
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
    } finally {
      setIsAdding(false);
      setShowChannelSelector(false);
    }
  }, [addCampaign]);

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    const camp = state.campaigns.find(c => c.id === id);
    if (camp) {
      setIsSaving(true);
      await storeUpdateCampaign({ ...camp, ...updates } as Campaign);
      setIsSaving(false);
      setEditingCampaign(null);
    }
  };

  const deleteCampaign = async (id: string) => {
    await storeDeleteCampaign(id);
    setEditingCampaign(null);
  };

  const toggleAutomation = async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (automation) {
      await updateFlow({ ...automation, active: !automation.active });
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight italic">Campanhas de Marketing</h1>
          <p className="text-slate-500 font-medium tracking-tight">Atraia clientes de volta com disparos inteligentes.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addCampaignChannel('WhatsApp')}
          disabled={isAdding}
          className={`bg-rose-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isAdding ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          Nova Campanha
        </motion.button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Alcance Total', value: '12.450', icon: <Users />, color: 'bg-blue-50 text-blue-600' },
          { label: 'Cliques (CTR)', value: '8.2%', icon: <MousePointer2 />, color: 'bg-green-50 text-green-600' },
          { label: 'Visualizações', value: '98k', icon: <Eye />, color: 'bg-purple-50 text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-6">
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-display font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Automation Section */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-brand-blue fill-brand-blue/20" />
              <h2 className="text-lg font-bold text-slate-900">Automação de Marketing</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Disparos automáticos baseados em comportamento do cliente.</p>
          </div>
          <button 
            onClick={() => setShowAutomationModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-black/5"
          >
            <Plus className="w-4 h-4" /> Configurar Automação
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {automations.map((auto) => (
            <div key={auto.id} className={`p-6 rounded-[32px] border transition-all ${auto.active ? 'border-brand-blue/10 bg-brand-blue/[0.02]' : 'border-slate-100 bg-white opacity-60'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${auto.active ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-slate-100 text-slate-400'}`}>
                  {auto.channel === 'Email' ? <Mail className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${auto.active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {auto.active ? 'Ativo' : 'Pausado'}
                  </span>
                  <button 
                    onClick={() => toggleAutomation(auto.id)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${auto.active ? 'bg-brand-blue' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${auto.active ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 mb-1">{auto.name}</h4>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Zap className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{auto.trigger}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Delay: {auto.delay}</span>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-[10px] font-bold text-slate-400 hover:text-brand-blue uppercase tracking-widest flex items-center gap-1 transition-colors">
                  <Edit className="w-3 h-3" /> Editar
                </button>
                <button className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 transition-colors">
                  <Trash2 className="w-3 h-3" /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold">Campanhas Ativas</h3>
               <button 
                 onClick={() => setShowChannelSelector(!showChannelSelector)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                   showChannelSelector 
                     ? 'bg-slate-100 text-slate-500' 
                     : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white'
                 }`}
               >
                 <Plus className={`w-3 h-3 transition-transform ${showChannelSelector ? 'rotate-45' : ''}`} /> 
                 Adicionar Canal
               </button>
             </div>

             <AnimatePresence>
               {showChannelSelector && (
                 <motion.div 
                   initial={{ opacity: 0, y: -10, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: -10, scale: 0.95 }}
                   className="absolute top-20 right-8 z-20 bg-white border border-slate-100 shadow-xl rounded-3xl p-2 min-w-[200px]"
                 >
                    {[
                      { id: 'Email Marketing', icon: <Mail className="w-4 h-4" />, name: 'Email Marketing' },
                      { id: 'SMS', icon: <MessageSquare className="w-4 h-4" />, name: 'SMS' },
                      { id: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" />, name: 'WhatsApp' },
                    ].map((channel) => (
                      <button 
                        key={channel.id}
                        onClick={() => addCampaignChannel(channel.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors text-left group"
                      >
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors">
                          {channel.icon}
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{channel.name}</span>
                      </button>
                    ))}
                 </motion.div>
               )}
             </AnimatePresence>

             <Reorder.Group 
               axis="y" 
               values={localCampaigns} 
               onReorder={saveCampaignsOrder}
               className="grid md:grid-cols-2 gap-6"
             >
               {localCampaigns.map((camp) => {
                 const conversionRate = camp.sent > 0 ? ((camp.converted / camp.sent) * 100).toFixed(1) : '0';
                 
                 return (
                   <Reorder.Item 
                     key={camp.id} 
                     value={camp}
                     className="flex flex-col p-6 rounded-[32px] border border-slate-50 hover:border-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/5 transition-all group bg-white cursor-grab active:cursor-grabbing relative"
                   >
                     <div className="flex items-start justify-between mb-4">
                       <div className="flex items-center gap-4">
                         <div className="flex items-center text-slate-300 group-hover:text-slate-400 transition-colors">
                           <GripVertical className="w-5 h-5" />
                         </div>
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                           camp.channel === 'Email Marketing' 
                             ? 'bg-purple-50 text-purple-500 group-hover:bg-purple-500 group-hover:text-white' 
                             : camp.channel === 'SMS'
                             ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'
                             : 'bg-green-50 text-green-500 group-hover:bg-green-500 group-hover:text-white'
                         }`}>
                           {camp.channel === 'Email Marketing' ? <Mail className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                         </div>
                         <div>
                           <h4 className="font-bold text-slate-900 text-base leading-tight mb-1">{camp.title}</h4>
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{camp.channel}</span>
                             <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                             <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                               camp.status === 'Running' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                             }`}>
                               {camp.status}
                             </span>
                           </div>
                         </div>
                       </div>
                       <button className="text-slate-300 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-xl transition-all">
                         <MoreVertical className="w-5 h-5"/>
                       </button>
                     </div>

                     <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                       <div>
                         <p className="text-xs font-bold text-slate-900">{camp.sent.toLocaleString()}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Enviados</p>
                       </div>
                       <div>
                         <p className="text-xs font-bold text-brand-blue">{camp.converted.toLocaleString()}</p>
                         <p className="text-[9px] font-bold text-brand-blue uppercase tracking-tighter">Conversões</p>
                       </div>
                       <div>
                         <p className="text-xs font-bold text-slate-900">{conversionRate}%</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Taxa (CR)</p>
                       </div>
                     </div>

                     <div className="mt-6 flex gap-2">
                       <button 
                         onClick={() => setShowReport(camp)}
                         className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all"
                       >
                         Relatório
                       </button>
                       <button 
                         onClick={() => setEditingCampaign(camp)}
                         className="flex-1 py-3 bg-brand-blue/5 hover:bg-brand-blue/10 border-2 border-transparent hover:border-slate-900 text-brand-blue rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
                       >
                         Configurar
                       </button>
                     </div>
                   </Reorder.Item>
                 );
               })}
             </Reorder.Group>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900 tracking-tight">Métricas de Performance</h3>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Últimos 30 Dias</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-slate-50">
                     <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Campanha</th>
                     <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alcance</th>
                     <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">CTR</th>
                     <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Conversões</th>
                     <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-4 text-right">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {localCampaigns.map((camp) => {
                      const ctr = camp.sent > 0 ? ((camp.converted / camp.sent) * 100).toFixed(1) : '0';
                      
                      return (
                        <tr key={camp.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 pl-4">
                            <span className="font-bold text-slate-900 text-sm block">{camp.title}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{camp.channel}</span>
                          </td>
                          <td className="py-5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${camp.status === 'Running' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                              {camp.status === 'Running' ? 'Ativa' : camp.status}
                            </span>
                          </td>
                          <td className="py-5">
                            <span className="text-sm font-medium text-slate-600">{camp.sent.toLocaleString()}</span>
                          </td>
                          <td className="py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-bold text-slate-900">{ctr}%</span>
                              <div className="w-12 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full bg-brand-blue" style={{ width: `${ctr}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-5 text-center">
                            <span className="text-sm font-bold text-brand-red">{camp.converted}</span>
                          </td>
                          <td className="py-5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setEditingCampaign(camp)}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-brand-blue transition-all"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteCampaign(camp.id)}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <h3 className="font-bold mb-8">Performance por Segmento</h3>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data}>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                   <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#E11D48' : '#0057FF'} />
                      ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-brand-blue p-8 rounded-[40px] text-white">
             <Megaphone className="w-10 h-10 mb-6" />
             <h3 className="text-xl font-bold mb-4 italic">Crie Audiências Inteligentes</h3>
             <p className="text-blue-100 font-medium mb-8">A Nanda consegue segmentar seus clientes por &quot;Hábito de Compra&quot; automaticamente. Experimente!</p>
             <button className="w-full bg-white text-brand-blue py-4 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                Começar Segmentação <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
      {/* Automation Modal */}
      <AnimatePresence>
        {showAutomationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAutomationModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nova Automação de E-mail</h2>
                    <p className="text-xs text-slate-500 font-medium">Configure gatilhos e disparos automáticos.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAutomationModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Plus className="w-6 h-6 text-slate-400 rotate-45" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gatilho de Entrada (Trigger)</label>
                    <select className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none">
                      <option>Pedido Abandonado</option>
                      <option>Primeira Compra Realizada</option>
                      <option>Inatividade (Mais de 30 dias)</option>
                      <option>Data de Aniversário</option>
                      <option>Recompra de Medicamento de Uso Contínuo</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tempo de Espera (Delay)</label>
                    <select className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none">
                      <option>Imediato</option>
                      <option>30 minutos</option>
                      <option>2 horas</option>
                      <option>24 horas</option>
                      <option>7 dias</option>
                    </select>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-4 h-4 text-brand-blue" />
                    <span className="text-xs font-bold text-slate-700">Visualização do Template</span>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-3 bg-slate-200 rounded-full" />
                    <div className="w-3/4 h-3 bg-slate-200 rounded-full" />
                    <div className="w-1/2 h-3 bg-slate-200 rounded-full opacity-50" />
                  </div>
                  <button className="text-xs font-bold text-brand-blue hover:underline">Editar Template de E-mail</button>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowAutomationModal(false)}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      setAutomations([{ 
                        id: Math.random().toString(), 
                        name: 'Nova Automação', 
                        trigger: 'Pedido Abandonado', 
                        channel: 'Email', 
                        active: true, 
                        delay: '2 horas' 
                      }, ...automations]);
                      setShowAutomationModal(false);
                    }}
                    className="flex-3 py-4 bg-brand-blue hover:bg-blue-600 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-2"
                  >
                    Ativar Automação <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Campaign Editor Modal */}
      <AnimatePresence>

      </AnimatePresence>

      <CampaignDraftModal 
        campaign={editingCampaign} 
        onClose={() => setEditingCampaign(null)} 
        onSave={(updates) => updateCampaign(editingCampaign!.id, updates)}
        onDelete={() => deleteCampaign(editingCampaign!.id)}
        isSaving={isSaving}
      />

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReport(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Relatório de Desempenho</h2>
                    <p className="text-xs text-slate-500 font-medium">{showReport.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowReport(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Plus className="w-6 h-6 text-slate-400 rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Enviados</p>
                  <p className="text-xl font-bold text-slate-900">{showReport.sent.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-brand-blue/5 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-1">Conversões</p>
                  <p className="text-xl font-bold text-brand-blue">{showReport.converted.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Taxa (CR)</p>
                  <p className="text-xl font-bold text-green-600">
                    {showReport.sent > 0 ? ((showReport.converted / showReport.sent) * 100).toFixed(1) : '0'}%
                  </p>
                </div>
              </div>

              <div className="h-64 w-full bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
                <div className="text-center text-slate-400">
                  <BarChart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">Gráfico de Conversão</p>
                </div>
              </div>

              <button 
                onClick={() => window.print()}
                className="w-full mt-8 py-4 border-2 border-slate-100 hover:border-slate-900 rounded-2xl font-bold text-sm transition-all"
              >
                Imprimir Relatório (PDF)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CampaignDraftModal({ campaign, onClose, onSave, onDelete, isSaving }: { 
  campaign: Campaign | null, 
  onClose: () => void, 
  onSave: (updates: Partial<Campaign>) => void,
  onDelete: () => void,
  isSaving: boolean
}) {
  const [draft, setDraft] = useState<Partial<Campaign>>({});

  useEffect(() => {
    if (campaign) {
      setDraft(campaign);
    }
  }, [campaign]);

  if (!campaign) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Editar Campanha</h3>
                <p className="text-xs text-slate-500 font-medium">Ajuste os detalhes e configurações.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <Plus className="w-6 h-6 text-slate-400 rotate-45" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Título da Campanha</label>
                <input 
                  type="text"
                  value={draft.title || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                  <select 
                    value={draft.status || ''}
                    onChange={(e) => setDraft(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                  >
                    <option value="Draft">Rascunho</option>
                    <option value="Running">Ativa</option>
                    <option value="Paused">Pausada</option>
                    <option value="Completed">Finalizada</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Canal</label>
                  <div className="w-full h-14 bg-slate-100 border border-slate-100 rounded-2xl px-5 flex items-center font-bold text-sm text-slate-400">
                    {draft.channel}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={onDelete}
                  className="flex-1 py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-all"
                >
                  Excluir
                </button>
                <button 
                  onClick={() => onSave(draft)}
                  disabled={isSaving}
                  className="flex-2 py-4 bg-brand-blue hover:bg-blue-600 disabled:bg-slate-400 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
