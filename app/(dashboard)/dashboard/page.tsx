'use client';

import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  DollarSign, 
  ArrowUpRight,
  MoreVertical,
  Zap,
  Bot,
  ListTodo,
  Clock,
  CheckCircle2,
  Star,
  Quote
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useStore } from '@/hooks/use-store';
import { useState, useEffect } from 'react';
import DashboardLoading from './loading';

const data = [
  { name: 'Seg', vendas: 4000, atendimentos: 2400 },
  { name: 'Ter', vendas: 3000, atendimentos: 1398 },
  { name: 'Qua', vendas: 2000, atendimentos: 9800 },
  { name: 'Qui', vendas: 2780, atendimentos: 3908 },
  { name: 'Sex', vendas: 1890, atendimentos: 4800 },
  { name: 'Sáb', vendas: 2390, atendimentos: 3800 },
  { name: 'Dom', vendas: 3490, atendimentos: 4300 },
];

export default function DashboardPage() {
  const { state } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated delay to showcase the sophisticated loading animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <DashboardLoading />;

  const pendingTasksCount = state.tasks.filter(t => t.status === 'pending' && t.responsible === state.user?.name).length;

  const cards = [
    { label: 'Vendas Hoje', value: `R$ ${state.stats.salesToday.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50', trend: '+12.5%' },
    { label: 'Atendimentos Ativos', value: state.stats.activeChats, icon: <MessageSquare className="w-5 h-5" />, color: 'text-brand-blue', bg: 'bg-blue-50', trend: '+3 novos' },
    { label: 'Novos Leads', value: state.stats.newLeads, icon: <Users className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+50%' },
    { label: 'Faturamento Mês', value: `R$ ${state.stats.monthlyRevenue.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-brand-red', bg: 'bg-red-50', trend: 'Meta: 85%' },
    { label: 'Satisfação', value: state.stats.averageRating.toFixed(1), icon: <Star className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50', trend: `${state.stats.totalReviews} avaliações` },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-10"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Visão Geral do Painel de Controle</h1>
          <p className="text-slate-500 font-medium">Bem-vindo, {state.user?.name}. Você tem {pendingTasksCount} tarefas para hoje.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Exportar PDF
          </button>
          <Link 
            href="/marketing"
            className="group relative px-6 py-2.5 bg-brand-blue text-white border-2 border-slate-900 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            <Zap className="w-4 h-4 fill-white group-hover:animate-pulse" /> Nova Campanha
          </Link>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center`}>
                {card.icon}
              </div>
              <button className="text-slate-300 hover:text-slate-600 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{card.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-display font-bold text-slate-900 leading-none">{card.value}</h3>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" /> {card.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-lg font-bold">Performance Semanal</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-blue" />
                  <span className="text-xs font-bold text-slate-500">Vendas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-red" />
                  <span className="text-xs font-bold text-slate-500">Atendimentos</span>
                </div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0057FF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0057FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="vendas" stroke="#0057FF" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="atendimentos" stroke="#E11D48" strokeWidth={3} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-[28px] border border-slate-100">
               <h3 className="font-bold mb-6">Equipe em Destaque</h3>
               <div className="space-y-4">
                 {[
                   { name: 'Socorro', leads: 42, conv: '82%', avatar: 'https://picsum.photos/seed/ana/100/100' },
                   { name: 'Maura', leads: 38, conv: '75%', avatar: 'https://picsum.photos/seed/marcos/100/100' },
                   { name: 'Lucineide', leads: 29, conv: '91%', avatar: 'https://picsum.photos/seed/julia/100/100' },
                 ].map((agent, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl overflow-hidden relative">
                         <Image 
                           src={agent.avatar} 
                           alt={agent.name}
                           fill
                           className="object-cover"
                           referrerPolicy="no-referrer"
                         />
                       </div>
                       <div>
                         <p className="text-sm font-bold">{agent.name}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">{agent.leads} Atendimentos</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-bold text-brand-blue">{agent.conv}</p>
                       <p className="text-[10px] font-bold text-slate-400">Conversão</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-[28px] relative overflow-hidden text-white">
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                  <Bot className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="text-lg font-bold mb-2">IA Nanda Relatório</h3>
                <p className="text-sm text-slate-400 font-medium mb-6">A Nanda detectou 12 possíveis compras hoje em conversas ativas.</p>
                <button className="w-full bg-brand-blue py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all">Ver Recomendações</button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Avaliações dos Clientes</h3>
                <p className="text-sm text-slate-500">O que estão falando da sua drogaria</p>
              </div>
              <Link href="#" className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">Ver Todas</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {state.reviews.map((review) => (
                <div key={review.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative border-2 border-white shadow-sm">
                      {review.avatar ? (
                        <Image 
                          src={review.avatar}
                          alt={review.customerName}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                          {review.customerName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{review.customerName}</p>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-4 h-4 text-slate-200" />
                    <p className="text-sm text-slate-600 italic font-medium leading-relaxed pl-4 line-clamp-3">
                      &quot;{review.comment}&quot;
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(review.date).toLocaleDateString()}</span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">Publicado</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
           {/* Pending Tasks Card */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm overflow-hidden relative"
           >
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
                      <ListTodo className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900">Suas Tarefas</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Para Hoje</p>
                   </div>
                </div>
                <Link href="/crm" className="text-[10px] font-bold text-brand-blue uppercase hover:underline">Ver Todas</Link>
             </div>

             {state.tasks.filter(t => t.status === 'pending' && t.responsible === state.user?.name).length > 0 ? (
               <div className="space-y-4">
                 <p className="text-sm font-medium text-slate-500">
                    Você tem <span className="text-brand-blue font-bold">{state.tasks.filter(t => t.status === 'pending' && t.responsible === state.user?.name).length}</span> tarefas pendentes para hoje.
                 </p>
                 <div className="space-y-3">
                    {state.tasks.filter(t => t.status === 'pending' && t.responsible === state.user?.name).slice(0, 2).map(task => (
                      <div key={task.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-xs font-bold text-slate-800 mb-1">{task.title}</p>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                            <Clock className="w-3 h-3" /> {task.dueDate || 'Hoje'}
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
             ) : (
               <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                     <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-500">Tudo em dia!</p>
                  <p className="text-[10px] text-slate-400 font-medium">Nenhuma tarefa pendente para agora.</p>
               </div>
             )}
             
             <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl" />
           </motion.div>

           <div className="bg-white p-6 rounded-[28px] border border-slate-100">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-bold">Produtos Mais Vendidos</h3>
               <Link href="#" className="text-xs font-bold text-brand-blue">Ver Todos</Link>
             </div>
             <div className="space-y-6">
               {state.products.map((product) => (
                 <div key={product.id} className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                     <Zap className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-bold truncate max-w-[140px]">{product.name}</p>
                     <p className="text-xs font-bold text-slate-400">{product.stock} em estoque</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-bold text-slate-900">R$ {product.price}</p>
                     <p className="text-[10px] font-bold text-green-600">+12%</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           <div className="bg-gradient-to-br from-brand-red to-rose-600 p-6 rounded-[32px] text-white">
              <h3 className="text-lg font-bold mb-2">Campanha ativa</h3>
              <p className="text-sm opacity-80 mb-6 font-medium">&quot;Recuperação Clientes Inativos&quot; está com 68% de cliques.</p>
              <div className="flex gap-2">
                <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[68%]" />
                </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
