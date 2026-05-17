'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

// Interfaces
export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'new' | 'attending' | 'negotiating' | 'closed' | 'lost';
  tags: string[];
  lastMessage?: string;
  updatedAt: string;
  aiInsight?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio';
  data?: string;
}

export interface ChatSession {
  id: string;
  clientId: string;
  attendantId?: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  messages: Message[];
  status: 'active' | 'archived' | 'spam';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  responsible: string;
  status: 'pending' | 'completed';
  relatedLeadId?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: {
    module: string;
    access: 'none' | 'view' | 'full';
  }[];
}

export interface TeamMember {
  id: string;
  name: string;
  username?: string;
  role: string;
  email: string;
  status: 'Admin' | 'Membro';
  image?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'published' | 'hidden';
  avatar?: string;
}

export interface TrainingExample {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface AutomationFlow {
  id: string;
  name: string;
  active: boolean;
  type: string;
  status: string;
  data: any;
  updatedAt: string;
  channel?: string;
  trigger?: string;
  delay?: string;
}

export interface Campaign {
  id: string;
  title: string;
  channel: string;
  status: string;
  sent: number;
  converted: number;
  updatedAt?: string;
}

interface StoreState {
  user: { name: string; email: string; company: string; role?: string; status?: string; pharmacyEmail?: string; image?: string; logo?: string; webhookConfig?: { endpoint: string; secret: string }; pedidoNovoWebhook?: { endpoint: string; secret: string }; connectedApps?: string[] } | null;
  leads: Lead[];
  products: Product[];
  tasks: Task[];
  roles: Role[];
  chats: ChatSession[];
  team: TeamMember[];
  reviews: Review[];
  trainingExamples: TrainingExample[];
  flows: AutomationFlow[];
  campaigns: Campaign[];
  stats: {
    salesToday: number;
    activeChats: number;
    newLeads: number;
    monthlyRevenue: number;
    totalReviews: number;
    averageRating: number;
  }
}

const initialLeads: Lead[] = [
  { id: '1', name: 'João Silva', phone: '(11) 98888-7777', email: 'joao@email.com', status: 'new', tags: ['VIP', 'Recorrente'], updatedAt: new Date().toISOString(), aiInsight: 'Interesse em Amoxicilina. Perfil recorrente.' },
  { id: '2', name: 'Maria Souza', phone: '(21) 97777-6666', email: 'maria@email.com', status: 'attending', tags: ['Antibiótico'], updatedAt: new Date().toISOString(), aiInsight: 'Enviou receita. Aguardando cotação.' },
  { id: '3', name: 'Carlos Oliveira', phone: '(31) 96666-5555', email: 'carlos@email.com', status: 'negotiating', tags: ['Hipertenso'], updatedAt: new Date().toISOString(), aiInsight: 'Busca alívio para dor. Orçamento alto.' },
];

const initialProducts: Product[] = [
  { id: 'p1', name: 'Amoxicilina 500mg', price: 24.90, category: 'Antibiótico', stock: 15 },
  { id: 'p2', name: 'Dipirona Monoidratada', price: 8.50, category: 'Analgésico', stock: 42 },
  { id: 'p3', name: 'Vitamina C 1g', price: 18.90, category: 'Suplemento', stock: 28 },
];

const initialChats: ChatSession[] = [
  { 
    id: 'c1', 
    clientId: '1', 
    lastMessage: 'Olá, gostaria de saber se tem o remédio...', 
    updatedAt: new Date().toISOString(), 
    unreadCount: 2,
    status: 'active',
    messages: [
      { id: 'm1', senderId: '1', text: 'Bom dia!', timestamp: new Date().toISOString(), type: 'text' },
      { id: 'm2', senderId: '1', text: 'Vocês têm Amoxicilina 500mg?', timestamp: new Date().toISOString(), type: 'text' },
    ]
  },
  { 
    id: 'c2', 
    clientId: '2', 
    lastMessage: 'A receita foi enviada.', 
    updatedAt: new Date().toISOString(), 
    unreadCount: 0,
    status: 'active',
    messages: [
      { id: 'm3', senderId: '2', text: 'Pode ver essa receita?', timestamp: new Date().toISOString(), type: 'text' },
    ]
  },
  { 
    id: 'c3', 
    clientId: '3', 
    lastMessage: 'Ok, obrigado pelo retorno!', 
    updatedAt: new Date().toISOString(), 
    unreadCount: 0,
    status: 'archived',
    messages: [
      { id: 'm4', senderId: '3', text: 'Ok, obrigado pelo retorno!', timestamp: new Date().toISOString(), type: 'text' },
    ]
  },
];

interface StoreContextType {
  state: StoreState;
  addLead: (lead: Omit<Lead, 'id' | 'updatedAt'>) => void;
  updateLeadStatus: (id: string, status: Lead['status']) => void;
  updateLead: (lead: Lead) => void;
  deleteLead: (id: string) => void;
  addTagToLead: (leadId: string, tag: string) => void;
  removeTagFromLead: (leadId: string, tag: string) => void;
  addTask: (task: Task) => void;
  updateRole: (role: Role) => void;
  addMessage: (chatId: string, message: Message) => void;
  setUser: (user: any) => void;
  updateUser: (updates: Partial<StoreState['user']>) => void;
  setProducts: (products: Product[]) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'> & { password?: string }) => Promise<void>;
  removeTeamMember: (memberId: string) => void;
  updateTeamMember: (memberId: string, updates: Partial<TeamMember>) => Promise<void>;
  updateMemberPassword: (userId: string, newPassword: string) => Promise<void>;
  addTrainingExample: (example: TrainingExample) => void;
  removeTrainingExample: (id: string) => void;
  addFlow: (flow: any) => Promise<void>;
  updateFlow: (flow: AutomationFlow) => Promise<void>;
  deleteFlow: (id: string) => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'updatedAt'>) => Promise<Campaign | undefined>;
  updateCampaign: (campaign: Campaign) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>({
    user: { 
      name: '', 
      email: '',
      company: '',
      pharmacyEmail: '',
      webhookConfig: { endpoint: '', secret: '' },
      pedidoNovoWebhook: { endpoint: '', secret: '' },
      image: ''
    },
    leads: [],
    products: [],
    tasks: [
      { id: 't1', title: 'Ligar para João Silva (Lead)', description: 'Confirmar recebimento do orçamento enviado ontem.', dueDate: '2024-05-04', responsible: 'Ricardo Dias', status: 'pending' },
      { id: 't2', title: 'Revisar estoque de Antibióticos', description: 'Verificar se a Amoxicilina está próxima do vencimento.', dueDate: '2024-05-05', responsible: 'Ricardo Dias', status: 'pending' },
    ],
    roles: [
      { 
        id: '1', 
        name: 'Administrador', 
        permissions: [
          { module: 'Dashboard', access: 'full' },
          { module: 'CRM', access: 'full' },
          { module: 'Chat', access: 'full' },
          { module: 'Automação', access: 'full' },
          { module: 'Relatórios', access: 'full' },
          { module: 'IA Nanda', access: 'full' },
          { module: 'Configurações', access: 'full' },
        ] 
      },
      { 
        id: '2', 
        name: 'Supervisor', 
        permissions: [
          { module: 'Dashboard', access: 'full' },
          { module: 'CRM', access: 'full' },
          { module: 'Chat', access: 'full' },
          { module: 'Automação', access: 'view' },
          { module: 'Relatórios', access: 'full' },
          { module: 'IA Nanda', access: 'view' },
          { module: 'Configurações', access: 'none' },
        ] 
      },
      { 
        id: '3', 
        name: 'Gerente', 
        permissions: [
          { module: 'Dashboard', access: 'full' },
          { module: 'CRM', access: 'full' },
          { module: 'Chat', access: 'view' },
          { module: 'Automação', access: 'none' },
          { module: 'Relatórios', access: 'full' },
          { module: 'IA Nanda', access: 'none' },
          { module: 'Configurações', access: 'none' },
        ] 
      },
      { 
        id: '4', 
        name: 'Atendente', 
        permissions: [
          { module: 'Dashboard', access: 'view' },
          { module: 'CRM', access: 'view' },
          { module: 'Chat', access: 'full' },
          { module: 'Automação', access: 'none' },
          { module: 'Relatórios', access: 'none' },
          { module: 'IA Nanda', access: 'none' },
          { module: 'Configurações', access: 'none' },
        ] 
      },
    ],
    team: [],
    chats: initialChats,
    reviews: [
      { id: '1', customerName: 'Felipe Amorim', rating: 5, comment: 'Atendimento excepcional e entrega super rápida. Recomendo!', date: '2024-05-04', status: 'published', avatar: 'https://picsum.photos/seed/felipe/100/100' },
      { id: '2', customerName: 'Sandra Melo', rating: 4, comment: 'Gostei muito da facilidade de pedir pelo WhatsApp.', date: '2024-05-03', status: 'published', avatar: 'https://picsum.photos/seed/sandra/100/100' },
      { id: '3', customerName: 'Roberto Junior', rating: 5, comment: 'Preços competitivos e equipe atenciosa.', date: '2024-05-02', status: 'published', avatar: 'https://picsum.photos/seed/roberto/100/100' },
    ],
    trainingExamples: [
      { 
        id: '1', 
        question: 'Qual o valor da Amoxicilina?', 
        answer: 'A Amoxicilina 500mg está saindo por R$ 24,90. Temos em estoque para pronta entrega!', 
        createdAt: new Date().toISOString() 
      },
      { 
        id: '2', 
        question: 'Minha garganta está doendo muito, o que você recomenda?', 
        answer: 'Olá! Sinto muito pelo desconforto. Como sou uma assistente virtual, recomendo fortemente que você consulte um médico ou farmacêutico para um diagnóstico seguro. No entanto, para alívio imediato dos sintomas, temos pastilhas e sprays que podem ajudar. Gostaria de ver as opções disponíveis em nosso estoque?', 
        createdAt: new Date().toISOString() 
      }
    ],
    flows: [
      { id: '1', name: 'Novo Lead WhatsApp → CRM', active: true, type: 'Webhook', status: 'Running', data: null, updatedAt: new Date().toISOString() },
      { id: '2', name: 'Pedido Pago → Notificar Equipe', active: true, type: 'n8n', status: 'Running', data: null, updatedAt: new Date().toISOString() },
      { id: '3', name: 'Cliente Inativo → Campanha Auto', active: false, type: 'Schedule', status: 'Paused', data: null, updatedAt: new Date().toISOString() },
      { id: '4', name: 'Receita Recebida → Trigger Nanda AI', active: true, type: 'Internal', status: 'Running', data: null, updatedAt: new Date().toISOString() },
    ],
    campaigns: [],
    stats: {
      salesToday: 4250.80,
      activeChats: 12,
      newLeads: 5,
      monthlyRevenue: 128450.00,
      totalReviews: 124,
      averageRating: 4.8
    }
  });

  // Sync logged-in user data from Supabase Auth + team_members table
  useEffect(() => {
    async function loadCurrentUser(authUser: any) {
      // If no auth user, do not wipe the UI - just skip
      if (!authUser) return;

      // Try to load profile from team_members using auth user_id
      const { data: member } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (member) {
        // Full profile found in team_members
        setState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            name: member.name,
            email: member.email,
            role: member.role,
            status: member.status,
            company: member.role || prev.user?.company || '',
            image: member.image || prev.user?.image,
          }
        }));
      } else {
        // No team_members record found — use auth email as fallback username
        const username = authUser.email?.replace('@sophis.intern', '') || authUser.email || '';
        setState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            name: prev.user?.name || username,
            email: authUser.email,
            role: prev.user?.role || 'Administrador',
            status: 'Admin',
            company: prev.user?.company || 'Administrador',
          }
        }));
      }
    }

    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadCurrentUser(session.user);
    });

    // Listen for future auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadCurrentUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync DB data (leads, products, team, flows, campaigns)
  useEffect(() => {
    async function sync() {
      try {
        const results = await Promise.allSettled([
          db.leads.list(),
          db.products.list(),
          db.team.list(),
          db.flows.list(),
          db.campaigns.list()
        ]);

        const leadsData = results[0].status === 'fulfilled' ? results[0].value : [];
        const productsData = results[1].status === 'fulfilled' ? results[1].value : [];
        const teamData = results[2].status === 'fulfilled' ? results[2].value : [];
        const flowsData = results[3].status === 'fulfilled' ? results[3].value : [];
        const campaignsData = results[4].status === 'fulfilled' ? results[4].value : [];

        // Log failures individually
        results.forEach((result, i) => {
          if (result.status === 'rejected') {
            const tables = ['leads', 'products', 'team_members', 'flows', 'campaigns'];
            console.warn(`Failed to sync table "${tables[i]}":`, result.reason);
          }
        });

        setState(prev => ({
          ...prev,
          leads: leadsData.map((l: any) => ({
            id: l.id,
            name: l.name,
            phone: l.phone,
            email: l.email,
            status: l.status,
            tags: l.tags || [],
            lastMessage: l.last_message,
            aiInsight: l.ai_insight,
            updatedAt: l.updated_at
          })),
          products: productsData.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            stock: p.quantity
          })),
          team: teamData.map((m: any) => ({
            id: m.id,
            name: m.name,
            username: m.username,
            role: m.role,
            email: m.email,
            status: m.status,
            image: m.image,
            user_id: m.user_id
          })),
          flows: flowsData.map((f: any) => ({
            id: f.id,
            name: f.name,
            active: true,
            type: 'WhatsApp',
            status: 'Running',
            data: f.definition,
            updatedAt: f.created_at
          })),
          campaigns: campaignsData.map((c: any) => ({
            id: c.id,
            title: c.title,
            channel: c.channel,
            status: c.status,
            sent: c.sent || 0,
            converted: c.converted || 0,
            updatedAt: c.updated_at
          }))
        }));
      } catch (error) {
        console.error('Critical sync error:', error);
      }
    }

    sync();
  }, []);


  const addLead = async (lead: Omit<Lead, 'id' | 'updatedAt'>) => {
    try {
      const { aiInsight, ...rest } = lead;
      const newLead = await db.leads.create({
        ...rest,
        ai_insight: aiInsight,
        status: lead.status || 'new',
        tags: lead.tags || []
      });

      setState(prev => ({ 
        ...prev, 
        leads: [{
          id: newLead.id,
          name: newLead.name,
          phone: newLead.phone,
          email: newLead.email,
          status: newLead.status,
          tags: newLead.tags || [],
          updatedAt: newLead.updated_at,
          aiInsight: newLead.ai_insight
        }, ...prev.leads] 
      }));
    } catch (error) {
      console.error('Failed to add lead to Supabase:', error);
    }
  };

  const updateLeadStatus = async (id: string, status: Lead['status']) => {
    try {
      await db.leads.update(id, { status });
      setState(prev => ({
        ...prev,
        leads: prev.leads.map(l => l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l)
      }));
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  const updateLead = async (updatedLead: Lead) => {
    try {
      await db.leads.update(updatedLead.id, {
        name: updatedLead.name,
        phone: updatedLead.phone,
        email: updatedLead.email,
        ai_insight: updatedLead.aiInsight
      });
      setState(prev => ({
        ...prev,
        leads: prev.leads.map(l => l.id === updatedLead.id ? { ...updatedLead, updatedAt: new Date().toISOString() } : l)
      }));
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await db.leads.delete(id);
      setState(prev => ({
        ...prev,
        leads: prev.leads.filter(l => l.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const addTagToLead = async (leadId: string, tag: string) => {
    const lead = state.leads.find(l => l.id === leadId);
    if (lead && !lead.tags.includes(tag)) {
      const newTags = [...lead.tags, tag];
      try {
        await db.leads.update(leadId, { tags: newTags });
        setState(prev => ({
          ...prev,
          leads: prev.leads.map(l => l.id === leadId ? { ...l, tags: newTags, updatedAt: new Date().toISOString() } : l)
        }));
      } catch (error) {
        console.error('Failed to add tag:', error);
      }
    }
  };

  const removeTagFromLead = async (leadId: string, tag: string) => {
    const lead = state.leads.find(l => l.id === leadId);
    if (lead) {
      const newTags = lead.tags.filter(t => t !== tag);
      try {
        await db.leads.update(leadId, { tags: newTags });
        setState(prev => ({
          ...prev,
          leads: prev.leads.map(l => l.id === leadId ? { ...l, tags: newTags, updatedAt: new Date().toISOString() } : l)
        }));
      } catch (error) {
        console.error('Failed to remove tag:', error);
      }
    }
  };

  const addTask = (task: Task) => {
    setState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
  };

  const updateRole = (updatedRole: Role) => {
    setState(prev => ({
      ...prev,
      roles: prev.roles.map(r => r.id === updatedRole.id ? updatedRole : r)
    }));
  };

  const addMessage = (chatId: string, message: Message) => {
    setState(prev => ({
      ...prev,
      chats: prev.chats.map(c => c.id === chatId ? { 
        ...c, 
        messages: [...c.messages, message],
        lastMessage: message.text,
        updatedAt: new Date().toISOString()
      } : c)
    }));
  };

  const setUser = (user: any) => setState(prev => ({ ...prev, user }));

  const updateUser = (updates: any) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : updates
    }));
  };

  const setProducts = (products: Product[]) => {
    setState(prev => ({ ...prev, products }));
  };

  const addTeamMember = async (member: Omit<TeamMember, 'id'> & { password?: string }) => {
    try {
      // 1. Create Auth user via API route
      const response = await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: member.email,
          name: member.name,
          role: member.role,
          username: member.username,
          password: member.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar usuário');
      }

      const { user } = await response.json();

      // 2. Create the DB record
      const { password, ...dbMember } = member;
      const newMember = await db.team.create({
        ...dbMember,
        user_id: user.id
      });

      setState(prev => ({ ...prev, team: [...prev.team, newMember] }));

    } catch (error) {
      console.error('Failed to add team member:', error);
      throw error;
    }
  };

  const removeTeamMember = async (memberId: string) => {
    try {
      await db.team.delete(memberId);
      setState(prev => ({ ...prev, team: prev.team.filter(m => m.id !== memberId) }));
    } catch (error) {
      console.error('Failed to remove team member:', error);
      throw error;
    }
  };

  const updateTeamMember = async (memberId: string, updates: Partial<TeamMember>) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', memberId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        team: prev.team.map(m => m.id === memberId ? { ...m, ...updates } : m)
      }));
    } catch (error) {
      console.error('Failed to update team member:', error);
      throw error;
    }
  };

  const updateMemberPassword = async (userId: string, newPassword: string) => {
    try {
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar senha');
      }
    } catch (error) {
      console.error('Failed to update password:', error);
      throw error;
    }
  };

  const addTrainingExample = (example: TrainingExample) => {
    setState(prev => ({ ...prev, trainingExamples: [example, ...prev.trainingExamples] }));
  };

  const removeTrainingExample = (id: string) => {
    setState(prev => ({ ...prev, trainingExamples: prev.trainingExamples.filter(e => e.id !== id) }));
  };
  
  const addFlow = async (flow: Omit<AutomationFlow, 'id' | 'updatedAt'>) => {
    try {
      const newFlow = await db.flows.create(flow);
      setState(prev => ({ ...prev, flows: [newFlow, ...prev.flows] }));
    } catch (error) {
      console.error('Failed to add flow:', error);
    }
  };

  const updateFlow = async (updatedFlow: AutomationFlow) => {
    try {
      await db.flows.update(updatedFlow.id, updatedFlow);
      setState(prev => ({
        ...prev,
        flows: prev.flows.map(f => f.id === updatedFlow.id ? updatedFlow : f)
      }));
    } catch (error) {
      console.error('Failed to update flow:', error);
    }
  };

  const deleteFlow = async (id: string) => {
    try {
      await db.flows.delete(id);
      setState(prev => ({
        ...prev,
        flows: prev.flows.filter(f => f.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete flow:', error);
    }
  };

  const addCampaign = async (campaign: Omit<Campaign, 'id' | 'updatedAt'>) => {
    try {
      const newCampaign = await db.campaigns.create(campaign);
      setState(prev => ({
        ...prev,
        campaigns: [newCampaign, ...prev.campaigns]
      }));
      return newCampaign;
    } catch (error: any) {
      console.error('Failed to add campaign:', error);
      // Log more details if available
      if (error.message) console.error('Error message:', error.message);
      if (error.details) console.error('Error details:', error.details);
      if (error.hint) console.error('Error hint:', error.hint);
    }
  };

  const updateCampaign = async (updatedCampaign: Campaign) => {
    try {
      await db.campaigns.update(updatedCampaign.id, updatedCampaign);
      setState(prev => ({
        ...prev,
        campaigns: prev.campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c)
      }));
    } catch (error) {
      console.error('Failed to update campaign:', error);
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await db.campaigns.delete(id);
      setState(prev => ({
        ...prev,
        campaigns: prev.campaigns.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const Provider = StoreContext.Provider;

  return (
    <Provider value={{ 
      state, 
      addLead, 
      updateLeadStatus, 
      updateLead,
      deleteLead,
      addTagToLead, 
      removeTagFromLead, 
      addTask, 
      updateRole, 
      addMessage, 
      setUser, 
      updateUser, 
      setProducts, 
      addTeamMember, 
      removeTeamMember,
      updateTeamMember,
      updateMemberPassword,
      addTrainingExample,
      removeTrainingExample,
      addFlow,
      updateFlow,
      deleteFlow,
      addCampaign,
      updateCampaign,
      deleteCampaign
    }}>
      {children}
    </Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
