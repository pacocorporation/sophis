'use client';

import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Store, 
  Users, 
  Bell, 
  CreditCard, 
  Shield, 
  Plus,
  MessageSquare,
  Globe, 
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity,
  Webhook,
  Eye,
  EyeOff,
  ChevronDown,
  Key,
  Camera,
  Database,
  Zap,
  ShoppingCart,
  Link2,
  Link2Off,
  ChevronUp
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useStore } from '@/hooks/use-store';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Upload } from 'lucide-react';

// ─── Integration Card ────────────────────────────────────────────────────────

interface IntegField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'url' | 'password';
  hint?: string;
}

interface IntegConfig {
  name: string;
  desc: string;
  docsUrl?: string;
  icon: React.ReactNode;
  iconBg: string;
  fields: IntegField[];
}

const INTEGRATIONS_CONFIG: IntegConfig[] = [
  {
    name: 'WhatsApp API',
    desc: 'Oficial Meta Business Suite. Envie e receba mensagens em escala via API.',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp',
    icon: <MessageSquare className="w-5 h-5 text-green-500" />,
    iconBg: 'bg-green-50',
    fields: [
      { key: 'whatsapp_token', label: 'Access Token', placeholder: 'EAAxxxxx...', type: 'password', hint: 'Gerado no Meta Business Suite → WhatsApp → Configurações da API' },
      { key: 'whatsapp_phone_id', label: 'Phone Number ID', placeholder: '1234567890123456', type: 'text', hint: 'Encontrado em Meta Business Suite → Números de Telefone' },
      { key: 'whatsapp_webhook_verify', label: 'Webhook Verify Token', placeholder: 'meu-token-secreto-123', type: 'text', hint: 'Defina qualquer string. Use o mesmo ao configurar o webhook no Meta.' },
    ],
  },
  {
    name: 'n8n',
    desc: 'Workflow Automation. Conecte automações entre sistemas e APIs externas.',
    docsUrl: 'https://docs.n8n.io/api/',
    icon: <Zap className="w-5 h-5 text-orange-500" />,
    iconBg: 'bg-orange-50',
    fields: [
      { key: 'n8n_base_url', label: 'URL Base do n8n', placeholder: 'https://n8n.seudominio.com', type: 'url', hint: 'URL onde seu servidor n8n está hospedado.' },
      { key: 'n8n_api_key', label: 'API Key', placeholder: 'n8n_api_xxxxxxxx', type: 'password', hint: 'Encontrado em n8n → Settings → API → Create API Key' },
    ],
  },
  {
    name: 'Receber Pedido Novo',
    desc: 'Receba dados de pedidos externos em tempo real via webhook.',
    icon: <ShoppingCart className="w-5 h-5 text-blue-500" />,
    iconBg: 'bg-blue-50',
    fields: [
      { key: 'pedido_endpoint', label: 'Endpoint URL', placeholder: 'https://sua-api.com/pedidos', type: 'url', hint: 'URL do seu servidor que receberá os dados do pedido (POST).' },
      { key: 'pedido_secret', label: 'Secret Key', placeholder: 'whsec_pedido_xxxxxxxx', type: 'password', hint: 'Chave secreta para validar a autenticidade dos eventos.' },
    ],
  },
  {
    name: 'Consys ERP',
    desc: 'Sincronize estoque, pedidos e cadastros de clientes com o Consys.',
    docsUrl: 'https://docs.consys.com.br',
    icon: <Database className="w-5 h-5 text-violet-500" />,
    iconBg: 'bg-violet-50',
    fields: [
      { key: 'consys_url', label: 'URL do Servidor', placeholder: 'https://api.consys.com.br/v2', type: 'url', hint: 'Endpoint base da API REST do Consys.' },
      { key: 'consys_key', label: 'API Key', placeholder: 'consys_live_xxxxxxxx', type: 'password', hint: 'Chave de integração. Acesse: Consys → Administração → Integrações.' },
      { key: 'consys_filial', label: 'Código da Filial', placeholder: '001', type: 'text', hint: 'Código numérico da filial cadastrada no Consys.' },
    ],
  },
  {
    name: 'Webhooks Custom',
    desc: 'Receba eventos da plataforma (leads, pedidos, chats) em endpoints próprios.',
    icon: <Webhook className="w-5 h-5 text-slate-600" />,
    iconBg: 'bg-slate-50',
    fields: [
      { key: 'webhook_endpoint', label: 'Endpoint URL', placeholder: 'https://sua-api.com/webhook', type: 'url', hint: 'URL que receberá os eventos via HTTP POST.' },
      { key: 'webhook_secret', label: 'Secret Key', placeholder: 'whsec_xxxxxxxxxxxxxxxx', type: 'password', hint: 'Usada para assinar os payloads (header X-Sophis-Signature).' },
    ],
  },
  {
    name: 'RD Station CRM',
    desc: 'Envie leads capturados automaticamente para o seu marketing.',
    docsUrl: 'https://developers.rdstation.com',
    icon: <Activity className="w-5 h-5 text-blue-600" />,
    iconBg: 'bg-sky-50',
    fields: [
      { key: 'rdstation_token', label: 'Token Público', placeholder: 'seu_token_rdstation', type: 'text', hint: 'Encontrado em RD Station → Perfil → Integrações → Token Público.' },
      { key: 'rdstation_key', label: 'API Key Privada', placeholder: 'rdstation_xxxxxxxx', type: 'password', hint: 'API Key privada gerada em RD Station → Configurações → API.' },
    ],
  },
];

function IntegrationCard({ integ }: { integ: IntegConfig }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(integ.fields.map(f => [f.key, '']))
  );
  const [showFields, setShowFields] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const isConnected = Object.values(values).some(v => v.trim() !== '');

  const handleSave = () => {
    // TODO: persist to Supabase / store
    // await supabase.from('integrations').upsert({ name: integ.name, config: values })
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDisconnect = () => {
    setValues(Object.fromEntries(integ.fields.map(f => [f.key, ''])));
    setOpen(false);
  };

  return (
    <motion.div
      layout
      className={`rounded-3xl border transition-all overflow-hidden ${
        isConnected
          ? 'border-green-200 bg-green-50/30'
          : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200'
      }`}
    >
      {/* Header row */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl shadow-sm ${integ.iconBg}`}>
            {integ.icon}
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-green-100 text-green-600">
                Conectado
              </span>
            )}
            {!isConnected && (
              <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase bg-brand-blue/10 text-brand-blue">
                Configurar
              </span>
            )}
          </div>
        </div>

        <h4 className="font-bold text-slate-900 mb-1">{integ.name}</h4>
        <p className="text-xs text-slate-500 font-medium mb-4">{integ.desc}</p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(v => !v)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
              open
                ? 'bg-slate-200 text-slate-600'
                : isConnected
                ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                : 'bg-brand-blue text-white hover:bg-blue-700'
            }`}
          >
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {open ? 'Fechar' : isConnected ? 'Editar Configuração' : 'Configurar'}
          </button>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              title="Desconectar"
              className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all"
            >
              <Link2Off className="w-4 h-4" />
            </button>
          )}
          {integ.docsUrl && (
            <a
              href={integ.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver documentação"
              className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Expanded config fields */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="fields"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-5">
              {integ.fields.map(field => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      type={field.type === 'password' && !showFields[field.key] ? 'password' : 'text'}
                      placeholder={field.placeholder}
                      value={values[field.key]}
                      onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none text-xs font-bold transition-all pr-10"
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowFields(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showFields[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {field.hint && (
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      💡 {field.hint}
                    </p>
                  )}
                </div>
              ))}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className={`w-full mt-2 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-brand-blue text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                }`}
              >
                {saved ? (
                  <><CheckCircle2 className="w-4 h-4" /> Salvo!</>
                ) : (
                  <><Link2 className="w-4 h-4" /> Salvar e Conectar</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const tabs = [
  { id: 'profile', label: 'Meu Perfil', icon: <User className="w-4 h-4" /> },
  { id: 'pharmacy', label: 'Minha Farmácia', icon: <Store className="w-4 h-4" /> },
  { id: 'team', label: 'Equipe', icon: <Users className="w-4 h-4" /> },
  { id: 'permissions', label: 'Permissões', icon: <Shield className="w-4 h-4" /> },
  { id: 'integrations', label: 'Integrações', icon: <Webhook className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notificações', icon: <Bell className="w-4 h-4" /> },
  { id: 'billing', label: 'Faturamento', icon: <CreditCard className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const { state, updateUser, updateRole, addTeamMember, removeTeamMember, updateTeamMember, updateMemberPassword } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>('1');
  const [webhookConfig, setWebhookConfig] = useState(state.user?.webhookConfig || {
    endpoint: '',
    secret: ''
  });
  const [pedidoNovoWebhook, setPedidoNovoWebhook] = useState(state.user?.pedidoNovoWebhook || {
    endpoint: '',
    secret: ''
  });
  const [pharmacyEmail, setPharmacyEmail] = useState(state.user?.pharmacyEmail || '');
  const [profileName, setProfileName] = useState(state.user?.name || '');
  const [profilePosition, setProfilePosition] = useState(state.user?.role || '');
  const [profilePhone, setProfilePhone] = useState(state.user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(state.user?.logo || null);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(state.user?.image || null);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({ 
    username: '', 
    name: '', 
    password: '', 
    role: 'Supervisor' 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userFileInputRef = useRef<HTMLInputElement>(null);

  // Sync profile fields when user data loads from Supabase
  const [profileSynced, setProfileSynced] = useState(false);
  if (state.user && !profileSynced) {
    if (state.user.name && !profileName) setProfileName(state.user.name);
    if (state.user.role && !profilePosition) setProfilePosition(state.user.role);
    if (state.user.phone && !profilePhone) setProfilePhone(state.user.phone);
    if (!profileSynced) setProfileSynced(true);
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.username || !newMemberForm.name || !newMemberForm.password) return;

    setIsSaving(true);
    try {
      await addTeamMember({
        username: newMemberForm.username,
        name: newMemberForm.name,
        email: `${newMemberForm.username.toLowerCase()}@sophis.intern`,
        password: newMemberForm.password,
        role: newMemberForm.role,
        status: newMemberForm.role === 'Administrador' ? 'Admin' : 'Membro'
      });
      setIsInviting(false);
      setNewMemberForm({ username: '', name: '', password: '', role: 'Supervisor' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Erro ao adicionar membro: ' + (error as any).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Persist to Supabase team_members for the logged-in user
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const updates: Record<string, any> = {
          name: profileName,
          role: profilePosition,
        };
        if (profilePhone) updates.phone = profilePhone;
        if (userImagePreview) updates.image = userImagePreview;

        const { error } = await supabase
          .from('team_members')
          .update(updates)
          .eq('user_id', session.user.id);

        if (error) throw error;
      }

      // 2. Update in-memory store so UI reflects immediately
      updateUser({
        name: profileName,
        role: profilePosition,
        logo: logoPreview || state.user?.logo,
        image: userImagePreview || state.user?.image,
        pharmacyEmail: pharmacyEmail,
        webhookConfig: webhookConfig,
        pedidoNovoWebhook: pedidoNovoWebhook
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      alert('Erro ao salvar: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e) {
      e.preventDefault();
      file = e.dataTransfer.files[0];
      setIsDraggingLogo(false);
    }

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
  };

  const handleUserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMemberImageUpdate = async (memberId: string, e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result as string;
        await updateTeamMember(memberId, { image: base64Image });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        alert('Erro ao atualizar imagem: ' + (error as any).message);
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePassword = async (member: any) => {
    if (!member.user_id) {
      if (confirm(`Este membro (${member.name}) ainda não possui acesso vinculado. Deseja criar uma conta de acesso para ele agora?`)) {
        const password = prompt(`Defina uma senha inicial para ${member.name}:`);
        if (!password) return;
        if (password.length < 6) {
          alert('A senha deve ter pelo menos 6 caracteres.');
          return;
        }

        setIsSaving(true);
        try {
          // Create the auth user first
          const response = await fetch('/api/send-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: member.email,
              name: member.name,
              password: password,
              role: member.role,
              username: member.username || member.email.split('@')[0]
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar conta de acesso');
          }

          const { user } = await response.json();

          // Link the user_id to the EXISTING record
          const { error: updateError } = await supabase
            .from('team_members')
            .update({ user_id: user.id })
            .eq('id', member.id);

          if (updateError) throw updateError;

          // Update local state
          const updatedTeam = state.team.map(m => 
            m.id === member.id ? { ...m, user_id: user.id } : m
          );
          state.team = updatedTeam; // This is a bit hacky since it's direct state manipulation if not careful, 
          // but we should use setState if exposed.
          // Since useStore returns state and doesn't expose a 'setTeam' directly, 
          // we might need to rely on the next refresh or update the store hook.
          // Wait, I'll update the store hook to have a 'refresh' or similar.
          
          alert('Acesso criado e vinculado com sucesso!');
        } catch (error) {
          alert('Erro ao vincular acesso: ' + (error as any).message);
        } finally {
          setIsSaving(false);
          // Force a reload of the component if needed, or just let it be.
          window.location.reload(); 
        }
      }
      return;
    }

    const newPassword = prompt(`Digite a nova senha para ${member.name}:`);
    if (!newPassword) return;

    if (newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsSaving(true);
    try {
      await updateMemberPassword(member.user_id, newPassword);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Erro ao atualizar senha: ' + (error as any).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight italic">Configurações</h1>
          <p className="text-slate-500 font-medium">Gerencie sua conta, equipe e preferências da plataforma.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            isSaving ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-blue text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95'
          }`}
        >
          {isSaving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Loader2 className="w-4 h-4" />
            </motion.div>
          ) : <Save className="w-4 h-4" />}
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${
              activeTab === tab.id 
                ? 'bg-white text-brand-blue shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold">Informações Básicas</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase">Usuário (login)</label>
                       <input 
                         type="text"
                         value={state.user?.email?.split('@')[0] || ''}
                         disabled
                         className="w-full px-4 py-3 bg-slate-100 border border-slate-100 rounded-xl font-medium text-slate-400 cursor-not-allowed"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase">Cargo / Função</label>
                       <input 
                         type="text" 
                         value={profilePosition}
                         onChange={(e) => setProfilePosition(e.target.value)}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase">Telefone</label>
                       <input 
                         type="text" 
                         value={profilePhone}
                         onChange={(e) => setProfilePhone(e.target.value)}
                         placeholder="+55 (21) 99999-0000"
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium transition-all"
                       />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold">Segurança</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex bg-slate-200 p-2 rounded-xl text-slate-600 mr-4">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-800">Autenticação em Dois Fatores (2FA)</p>
                      <p className="text-xs text-slate-500 font-medium">Adicione uma camada extra de segurança à sua conta.</p>
                    </div>
                    <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">Ativar</button>
                  </div>
                  <button className="text-brand-blue font-bold text-sm hover:underline">Alterar Senha de Acesso</button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div 
                      onClick={() => userFileInputRef.current?.click()}
                      className="w-full h-full rounded-[32px] overflow-hidden bg-slate-100 ring-4 ring-slate-50 ring-offset-2 relative cursor-pointer group"
                    >
                      <Image 
                        src={userImagePreview || "/avatar-default.svg"} 
                        alt="Profile"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <button 
                      onClick={() => userFileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-brand-blue border border-slate-100 hover:scale-105 transition-all z-10"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <input 
                      type="file"
                      ref={userFileInputRef}
                      onChange={handleUserImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <h4 className="font-bold text-slate-900">{state.user?.name}</h4>
                  <p className="text-sm font-medium text-slate-500">{state.user?.company}</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[32px] text-white">
                  <Activity className="w-8 h-8 mb-4 text-brand-blue" />
                  <h4 className="font-bold mb-2">Resumo de Atividade</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                    Você realizou <span className="text-white">128 interações</span> esta semana. Seu engajamento está acima da média!
                  </p>
                  <button className="w-full bg-white/10 border border-white/10 hover:bg-white/20 py-3 rounded-xl font-bold text-xs transition-all">Ver Meu Histórico</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pharmacy' && (
            <div className="space-y-8">
               <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-lg font-bold">Dados da Unidade</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">Nome da Farmácia</label>
                          <input type="text" defaultValue="Drogaria Max - Barra da Tijuca" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">CNPJ</label>
                          <input type="text" defaultValue="00.123.456/0001-99" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">Inscrição Estadual</label>
                          <input type="text" defaultValue="123.456.789.111" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">E-mail da Farmácia</label>
                          <input 
                            type="email" 
                            value={pharmacyEmail}
                            onChange={(e) => setPharmacyEmail(e.target.value)}
                            placeholder="contato@farmacia.com"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium" 
                          />
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">Endereço Completo</label>
                          <textarea 
                            rows={3} 
                            defaultValue="Av. Lúcio Costa, 3460 - Barra da Tijuca, Rio de Janeiro - RJ, 22630-010, Loja 113" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium resize-none" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase">Horário de Funcionamento</label>
                          <input type="text" defaultValue="Seg à Sáb: 07:30 - 23:30 | Dom: 08:00 - 23:00" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium" />
                       </div>
                    </div>
                  </div>
               </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold">Logotipo e Identidade visual</h3>
                  <div className="flex items-center gap-8">
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleLogoUpload}
                        className={`w-32 h-32 rounded-[40px] flex items-center justify-center border-4 border-white shadow-inner relative cursor-pointer group overflow-hidden transition-all ${
                          isDraggingLogo ? 'bg-brand-blue/10 scale-105 ring-4 ring-brand-blue/20' : 'bg-slate-50'
                        }`}
                     >
                        {logoPreview ? (
                           <Image 
                              src={logoPreview} 
                              alt="Pharmacy Logo"
                              fill
                              className="object-contain p-4 group-hover:scale-110 transition-transform"
                              referrerPolicy="no-referrer"
                           />
                        ) : (
                           <div className="text-center flex flex-col items-center">
                              <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors mb-2">
                                <Store className="w-6 h-6" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-blue transition-colors uppercase tracking-wider">Logo Vazio</span>
                           </div>
                        )}
                        <div className="absolute inset-0 bg-brand-blue/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Upload className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform" />
                        </div>
                        <input 
                           type="file" 
                           ref={fileInputRef}
                           onChange={handleLogoUpload as any}
                           accept="image/*"
                           className="hidden"
                        />
                     </div>
                     <div className="flex-1">
                        <p className="font-bold text-slate-800 mb-2">Personalize a identidade da sua unidade</p>
                        <p className="text-sm text-slate-500 font-medium mb-4">Este logotipo será exibido nos orçamentos em PDF, na plataforma e na página de checkout da Nanda.</p>
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                           >
                             Alterar Logotipo
                           </button>
                           {logoPreview && (
                             <button 
                               onClick={() => setLogoPreview(null)}
                               className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all"
                             >
                               Remover
                             </button>
                           )}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            )}

          {activeTab === 'team' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-bold">Membros da Equipe</h3>
                   {!isInviting && (
                     <button 
                      onClick={() => setIsInviting(true)}
                      className="bg-brand-blue text-white px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                     >
                        <Plus className="w-4 h-4" /> Convidar Membro
                     </button>
                   )}
                </div>

                <AnimatePresence>
                  {isInviting && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mb-10 bg-white p-10 rounded-[32px] border border-slate-100 shadow-xl space-y-8"
                    >
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">Novo usuário</h3>
                        <p className="text-sm text-slate-500 mt-1">Campos marcados com * são obrigatórios</p>
                      </div>

                      <form key="new-member-form-v2" onSubmit={handleInviteMember} className="space-y-6" autoComplete="off">
                        <div className="space-y-6">
                          <div className="space-y-1">
                            <label className="text-[13px] font-bold text-red-500 ml-1">Usuário *</label>
                            <input 
                              type="text" 
                              required
                              autoComplete="off"
                              value={newMemberForm.username}
                              onChange={(e) => setNewMemberForm({ ...newMemberForm, username: e.target.value })}
                              className="w-full px-5 py-4 bg-slate-50 border-b-2 border-red-500 focus:outline-none font-medium text-slate-700 transition-all"
                              placeholder="ex: joao.silva"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[13px] font-bold text-slate-500 ml-1">Nome *</label>
                            <input 
                              type="text" 
                              required
                              autoComplete="off"
                              value={newMemberForm.name}
                              onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                              className="w-full px-5 py-4 bg-slate-50 border-b-2 border-slate-200 focus:border-brand-blue focus:outline-none font-medium text-slate-700 transition-all"
                              placeholder="Nome completo"
                            />
                          </div>

                          <div className="space-y-1 relative">
                            <label className="text-[13px] font-bold text-slate-500 ml-1">Senha *</label>
                            <div className="relative">
                              <input 
                                type={showPassword ? "text" : "password"} 
                                required
                                value={newMemberForm.password}
                                onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-b-2 border-slate-200 focus:border-brand-blue focus:outline-none font-medium text-slate-700 transition-all"
                              />
                              <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-all"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="px-5 py-3 bg-slate-200/50 border-b-2 border-slate-900 rounded-t-lg flex items-center justify-between cursor-pointer">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo</span>
                                <select 
                                  value={newMemberForm.role}
                                  onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-sm"
                                >
                                  <option value="Administrador">Administrador</option>
                                  <option value="Supervisor">Supervisor</option>
                                  <option value="Gerente">Gerente</option>
                                  <option value="Atendente">Atendente</option>
                                </select>
                              </div>
                              <ChevronDown className="w-5 h-5 text-slate-900" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-6 pt-8">
                          <button 
                            type="button"
                            onClick={() => setIsInviting(false)}
                            className="px-6 py-2 rounded-xl font-bold text-lg text-slate-900 hover:bg-slate-50 transition-all"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit"
                            disabled={isSaving}
                            className={`px-10 py-3 rounded-2xl font-bold text-lg transition-all ${
                              isSaving ? 'bg-slate-100 text-slate-300' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {isSaving ? 'Processando...' : 'Adicionar'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="space-y-2">
                   {state.team.map((member, i) => (
                     <motion.div 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={member.id} 
                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all rounded-2xl group"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden relative">
                              <Image src={member.image || "/avatar-default.svg"} alt={member.name} fill className="object-cover" />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-slate-800">{member.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{member.role}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-10">
                           <p className="text-sm font-medium text-slate-500">{member.username || member.email.split('@')[0]}</p>
                           <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${member.status === 'Admin' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 text-slate-500'}`}>
                               {member.status}
                           </span>
                           <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                             <button 
                               onClick={() => {
                                 const input = document.createElement('input');
                                 input.type = 'file';
                                 input.accept = 'image/*';
                                 input.onchange = (e: any) => handleMemberImageUpdate(member.id, e);
                                 input.click();
                               }}
                               title="Alterar Foto"
                               className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all"
                             >
                               <Camera className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => handleUpdatePassword(member)}
                               title="Trocar Senha"
                               className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all"
                             >
                               <Key className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={async () => {
                                 if (confirm(`Tem certeza que deseja remover ${member.name}?`)) {
                                   try {
                                     await removeTeamMember(member.id);
                                   } catch (error) {
                                     alert('Erro ao remover membro: ' + (error as any).message);
                                   }
                                 }
                               }}
                               title="Remover Membro"
                               className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                             >
                               <AlertCircle className="w-4 h-4 rotate-45" />
                             </button>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 border-r border-slate-100 pr-8">
                 <h3 className="text-lg font-bold mb-6">Níveis de Acesso</h3>
                 <div className="space-y-2">
                    {state.roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                          selectedRoleId === role.id 
                            ? 'bg-brand-blue text-white shadow-xl shadow-blue-500/20' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {role.name}
                        {selectedRoleId === role.id && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                 </div>
                 <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Novo Nível
                 </button>
              </div>

              <div className="lg:col-span-3 space-y-8">
                 {selectedRoleId && (
                   <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Editar Permissões: {state.roles.find(r => r.id === selectedRoleId)?.name}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Defina o que este cargo pode ver ou editar</p>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-50">
                        {state.roles.find(r => r.id === selectedRoleId)?.permissions.map((perm, i) => (
                          <div key={perm.module} className="py-6 flex items-center justify-between">
                            <div>
                               <p className="font-bold text-slate-800">{perm.module}</p>
                               <p className="text-xs text-slate-500 font-medium">Controle de acesso para o módulo de {perm.module.toLowerCase()}</p>
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                              {['none', 'view', 'full'].map((level) => {
                                const labels: any = { none: 'Remover Acesso', view: 'Apenas Ver', full: 'Acesso Total' };
                                return (
                                  <button
                                    key={level}
                                    onClick={() => {
                                      const role = state.roles.find(r => r.id === selectedRoleId);
                                      if (role) {
                                        const newPermissions = role.permissions.map(p => 
                                          p.module === perm.module ? { ...p, access: level as any } : p
                                        );
                                        updateRole({ ...role, permissions: newPermissions });
                                      }
                                    }}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                      perm.access === level 
                                        ? 'bg-white text-brand-blue shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                  >
                                    {labels[level]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Canais e Integrações</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Conecte sua farmácia às ferramentas do mercado</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {INTEGRATIONS_CONFIG.map((integ, i) => (
                    <IntegrationCard key={i} integ={integ} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 max-w-2xl">
               <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-lg font-bold">Alertas e Notificações</h3>
                  <div className="space-y-6">
                     {[
                       { title: 'Novos Leads via WhatsApp', desc: 'Alertar quando um novo cliente entrar em contato.', icon: <MessageSquare className="text-blue-500" /> },
                       { title: 'Estoque Crítico', desc: 'Notificar quando um produto atingir o estoque mínimo.', icon: <Store className="text-red-500" /> },
                       { title: 'Metas de Vendas', desc: 'Relatório diário de desempenho da farmácia.', icon: <CheckCircle2 className="text-green-500" /> },
                       { title: 'Segurança e Login', desc: 'Alertar sobre novos acessos em dispositivos desconhecidos.', icon: <Shield className="text-slate-500" /> },
                     ].map((notif, i) => (
                       <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-slate-50 rounded-2xl">{notif.icon}</div>
                             <div>
                                <p className="font-bold text-sm text-slate-800">{notif.title}</p>
                                <p className="text-xs text-slate-500 font-medium">{notif.desc}</p>
                             </div>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-blue">
                             <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="grid lg:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-lg font-bold">Seu Plano</h3>
                  <div className="p-6 bg-slate-900 rounded-[32px] text-white relative overflow-hidden">
                     <div className="relative z-10">
                        <span className="text-[10px] font-bold bg-brand-blue px-3 py-1 rounded-full uppercase tracking-widest">Enterprise</span>
                        <h4 className="text-3xl font-display font-bold mt-4">R$ 499,90 <span className="text-sm font-sans font-medium text-slate-400">/mês</span></h4>
                        <p className="text-slate-400 text-sm mt-2 font-medium">Próxima cobrança em 15 de Outubro</p>
                        <div className="mt-8 space-y-3">
                           {['Nanda I.A Ilimitada', '10 Usuários', 'Integração WhatsApp CRM', 'Suporte VIP 24h'].map((feat, i) => (
                             <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-brand-blue" /> {feat}
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/20 blur-3xl rounded-full" />
                  </div>
                  <button className="w-full py-4 border border-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Alterar Plano</button>
               </div>

               <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-lg font-bold">Forma de Pagamento</h3>
                  <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                           <CreditCard className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                           <p className="font-bold text-sm text-slate-800">Mastercard •••• 4421</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Expira em 10/2028</p>
                        </div>
                     </div>
                     <button className="text-brand-blue font-bold text-xs hover:underline">Editar</button>
                  </div>

                  <h3 className="text-lg font-bold pt-4">Histórico de Faturas</h3>
                  <div className="space-y-4">
                     {[
                       { date: 'Set 2024', val: 'R$ 499,90' },
                       { date: 'Ago 2024', val: 'R$ 499,90' },
                       { date: 'Jul 2024', val: 'R$ 429,90' },
                     ].map((inv, i) => (
                       <div key={i} className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-500">{inv.date}</span>
                          <span className="font-bold text-slate-800">{inv.val}</span>
                          <button className="text-slate-400 hover:text-brand-blue">Baixar PDF</button>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 className="w-6 h-6" />
            Configurações salvas com sucesso!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
