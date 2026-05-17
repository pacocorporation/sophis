'use client';

import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Plus, 
  Play, 
  Globe, 
  Webhook, 
  Settings2,
  ChevronRight,
  Database,
  Link2,
  Network,
  X,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import FlowBuilder from '@/components/automation/flow-builder';
import { useStore } from '@/hooks/use-store';

const integrationsData = [
  { id: 'n8n', name: 'n8n', icon: <Network className="w-6 h-6" />, desc: 'Workflow automation engine', fields: ['Webhook URL', 'API Key'] },
  { id: 'pedido_novo', name: 'Receber Pedido Novo', icon: <Webhook className="w-6 h-6" />, desc: 'Receber dados de sistemas externos', fields: ['Endpoint URL', 'Secret Key'] },
  { id: 'consys', name: 'Consys ERP', icon: <Database className="w-6 h-6" />, desc: 'Farmácias ERP Integration', fields: ['Server IP/URL', 'Auth Token'] },
  { id: 'whatsapp', name: 'WhatsApp API', icon: <Globe className="w-6 h-6" />, desc: 'Oficial Meta Business API', fields: ['Access Token', 'Phone ID', 'Business ID'] },
  { id: 'webhooks', name: 'Webhooks Custom', icon: <Webhook className="w-6 h-6" />, desc: 'Custom endpoints for developers', fields: ['Endpoint URL', 'Secret Key'] },
];

export default function AutomationPage() {
  const { state, updateUser, addFlow, updateFlow } = useStore();
  const [activeIntegration, setActiveIntegration] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFlowBuilder, setShowFlowBuilder] = useState(false);
  const [editingFlow, setEditingFlow] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Derive connected apps and flows from store
  const connectedApps = state.user?.connectedApps || [];
  const flows = state.flows || [];

  const handleSelectIntegration = (int: any) => {
    setActiveIntegration(int);
    if (int?.id === 'pedido_novo') {
      setFormData({
        'Endpoint URL': state.user?.pedidoNovoWebhook?.endpoint || '',
        'Secret Key': state.user?.pedidoNovoWebhook?.secret || ''
      });
    } else if (int?.id === 'webhooks') {
      setFormData({
        'Endpoint URL': state.user?.webhookConfig?.endpoint || '',
        'Secret Key': state.user?.webhookConfig?.secret || ''
      });
    } else {
      setFormData({});
    }
  };

  const handleConnect = () => {
    if (activeIntegration.id === 'pedido_novo') {
      const secret = formData['Secret Key'] || '';
      if (secret.length < 8) {
        return; // Don't allow connection if secret is too short
      }
    }

    setIsConnecting(true);
    
    // Save to store
    const updates: any = {
      connectedApps: [...new Set([...connectedApps, activeIntegration.id])]
    };

    if (activeIntegration.id === 'pedido_novo') {
      updates.pedidoNovoWebhook = {
        endpoint: formData['Endpoint URL'],
        secret: formData['Secret Key']
      };
    } else if (activeIntegration.id === 'webhooks') {
      updates.webhookConfig = {
        endpoint: formData['Endpoint URL'],
        secret: formData['Secret Key']
      };
    }

    updateUser(updates);

    setTimeout(() => {
      setIsConnecting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveIntegration(null);
      }, 2000);
    }, 1500);
  };

  const handleSaveFlow = (flowData: any) => {
    if (editingFlow) {
      updateFlow({
        ...editingFlow,
        name: flowData.name,
        data: { nodes: flowData.nodes, edges: flowData.edges },
        updatedAt: new Date().toISOString()
      });
    } else {
      addFlow({
        id: Math.random().toString(36).substr(2, 9),
        name: flowData.name,
        active: true,
        type: 'Flow',
        status: 'Running',
        data: { nodes: flowData.nodes, edges: flowData.edges },
        updatedAt: new Date().toISOString()
      });
    }
    
    setShowFlowBuilder(false);
    setEditingFlow(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (showFlowBuilder) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-100 p-4 lg:p-10 overflow-hidden flex flex-col">
        <FlowBuilder 
          onClose={() => setShowFlowBuilder(false)} 
          onSave={handleSaveFlow}
          initialData={editingFlow}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight italic italic">Automações & Webhooks</h1>
          <p className="text-slate-500 font-medium">Conecte a Nanda Cloud a qualquer ferramenta externa.</p>
        </div>
        <button 
          onClick={() => setShowFlowBuilder(true)}
          className="bg-brand-blue text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Criar Fluxo
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Seus Fluxos Ativos</h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 <button className="px-4 py-1.5 bg-white text-brand-blue text-xs font-bold rounded-lg shadow-sm">Todos</button>
                 <button className="px-4 py-1.5 text-slate-400 text-xs font-bold rounded-lg">Webhooks</button>
              </div>
            </div>
            <div className="space-y-4">
              {flows.map((flow, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-all group">
                   <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${flow.active ? 'bg-blue-100 text-brand-blue' : 'bg-slate-100 text-slate-400'}`}>
                        <Zap className="w-6 h-6" />
                     </div>
                     <div>
                       <p className="font-bold text-slate-900">{flow.name}</p>
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{flow.type}</span>
                         <span className="w-1 h-1 bg-slate-300 rounded-full" />
                         <span className={`text-[10px] font-bold uppercase tracking-widest ${flow.active ? 'text-green-500' : 'text-slate-400'}`}>{flow.status}</span>
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <button 
                        onClick={() => { setEditingFlow(flow); setShowFlowBuilder(true); }}
                        className="p-3 text-slate-400 hover:text-brand-blue rounded-xl hover:bg-white transition-all"
                      >
                        <Settings2 className="w-5 h-5"/>
                      </button>
                     <button className={`p-3 rounded-xl transition-all ${flow.active ? 'bg-brand-red/10 text-brand-red' : 'bg-green-100 text-green-600'}`}>
                        {flow.active ? <Plus className="w-5 h-5 transform rotate-45" /> : <Play className="w-5 h-5" />}
                     </button>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative">
             <div className="relative z-10 lg:flex items-center justify-between gap-12">
               <div className="flex-1">
                 <h2 className="text-3xl font-display font-bold mb-4">Integrar com n8n?</h2>
                 <p className="text-slate-400 text-lg mb-8 font-medium">Use nossos webhooks oficiais para disparar fluxos no n8n a cada nova venda ou mensagem recebida.</p>
                 <button 
                  onClick={() => handleSelectIntegration(integrationsData[0])}
                  className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                 >
                   Configurar Endpoint <Link2 className="w-5 h-5" />
                 </button>
               </div>
               <div className="hidden lg:block w-48 h-48 bg-white/10 rounded-full border-4 border-white/5 flex items-center justify-center p-8">
                  <Network className="w-full h-full text-blue-300" />
               </div>
             </div>
             <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-blue/30 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
             <h3 className="font-bold mb-8 italic text-slate-900 leading-tight tracking-tight">Conectar Apps</h3>
             <div className="grid grid-cols-1 gap-4">
               {integrationsData.map((int, i) => {
                 const isConnected = connectedApps.includes(int.id);
                 return (
                  <div 
                    key={i} 
                    onClick={() => handleSelectIntegration(int)}
                    className={`flex items-center gap-4 p-4 border rounded-3xl transition-all cursor-pointer group ${
                      isConnected ? 'border-green-100 bg-green-50/30' : 'border-slate-50 hover:border-brand-blue/30'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isConnected ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 group-hover:text-brand-blue group-hover:bg-blue-50'
                    }`}>
                      {isConnected ? <CheckCircle2 className="w-6 h-6" /> : int.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{int.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[120px]">{isConnected ? 'App Conectado' : int.desc}</p>
                      {int.id === 'pedido_novo' && !isConnected && (
                        <button 
                          className="mt-2 px-3 py-1 bg-brand-blue text-white text-[9px] font-black uppercase rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectIntegration(int);
                          }}
                        >
                          Configurar Webhook
                        </button>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-all ${isConnected ? 'text-green-400' : 'text-slate-300 group-hover:translate-x-1'}`} />
                  </div>
                 );
               })}
             </div>
           </div>

           <div className="bg-blue-600 p-8 rounded-[32px] text-white overflow-hidden relative">
              <Zap className="w-8 h-8 mb-4 fill-white relative z-10" />
              <h3 className="text-lg font-bold mb-2 relative z-10">Dica de Automação</h3>
              <p className="text-sm opacity-80 font-medium relative z-10">Configure &quot;Pedido Criado &rarr; Chat WhatsApp&quot; para enviar o link de pagamento instantaneamente ao cliente.</p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-10 -translate-y-10" />
           </div>
        </div>
      </div>

      <AnimatePresence>
        {activeIntegration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isConnecting && setActiveIntegration(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              layoutId={`int-${activeIntegration.id}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center">
                    {activeIntegration.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">Conectar {activeIntegration.name}</h3>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{activeIntegration.desc}</p>
                  </div>
                </div>
                {!isConnecting && (
                  <button 
                    onClick={() => setActiveIntegration(null)}
                    className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-blue-50/50 p-6 rounded-3xl flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Sua conexão é segura</p>
                    <p className="text-xs font-medium text-slate-500">Seus dados de API são criptografados e nunca compartilhados com terceiros.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeIntegration.fields.map((field: string) => (
                    <div key={field} className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{field}</label>
                       <div className="relative">
                          {field.toLowerCase().includes('key') || field.toLowerCase().includes('token') ? (
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          ) : (
                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          )}
                          <input 
                            type={field.toLowerCase().includes('key') || field.toLowerCase().includes('token') ? 'password' : 'text'} 
                            placeholder={`Insira aqui seu ${field}`}
                            value={formData[field] || ''}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium transition-all ${
                              activeIntegration.id === 'pedido_novo' && field === 'Secret Key' && formData[field]?.length > 0 && formData[field]?.length < 8
                                ? 'border-red-300 focus:ring-red-100'
                                : 'border-slate-100'
                            }`}
                          />
                          {activeIntegration.id === 'pedido_novo' && field === 'Secret Key' && formData[field]?.length > 0 && formData[field]?.length < 8 && (
                            <p className="text-[10px] font-bold text-red-500 mt-2 uppercase flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                              <AlertCircle className="w-3 h-3" /> A Secret Key deve ter pelo menos 8 caracteres
                            </p>
                          )}
                       </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    onClick={() => setActiveIntegration(null)}
                    disabled={isConnecting}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConnect}
                    disabled={isConnecting || (activeIntegration.id === 'pedido_novo' && (formData['Secret Key']?.length || 0) < 8)}
                    className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <Network className="w-5 h-5" />
                      </motion.div>
                    ) : <Zap className="w-5 h-5 group-hover:scale-110" />}
                    {isConnecting ? 'Validando...' : 'Testar & Conectar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 className="w-6 h-6" />
            Integração configurada com sucesso!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

