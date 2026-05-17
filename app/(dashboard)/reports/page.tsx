'use client';

import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  MapPin, 
  Download,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const pieData = [
  { name: 'WhatsApp', value: 400 },
  { name: 'Loja Física', value: 300 },
  { name: 'E-commerce', value: 300 },
];
const COLORS = ['#0057FF', '#E11D48', '#10B981'];

export default function ReportsPage() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight italic">Relatórios Avançados</h1>
          <p className="text-slate-500 font-medium">Analise cada centímetro da sua operação farmacêutica.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-700">Últimos 30 dias</span>
           </div>
           <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
             <Download className="w-4 h-4" /> Exportar Dados
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <h3 className="text-lg font-bold mb-8">Origem das Vendas</h3>
           <div className="h-80 w-full flex items-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="space-y-4 pr-12">
               {pieData.map((d, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                   <div>
                     <p className="text-xs font-bold text-slate-900">{d.name}</p>
                     <p className="text-[10px] font-bold text-slate-400">{((d.value/1000)*100)}%</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-8">
           <h3 className="text-lg font-bold italic italic">Insights Estratégicos</h3>
           <div className="space-y-6">
             {[
               { icon: <TrendingUp className="text-blue-400" />, text: "Suas vendas no WhatsApp cresceram 18% em relação ao mês anterior." },
               { icon: <Users className="text-red-400" />, text: "Pico de atendimentos identificado entre 18:00 e 20:00." },
               { icon: <Package className="text-green-400" />, text: "Amoxicilina é seu produto com maior giro e conversão via IA." },
             ].map((insight, i) => (
               <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    {insight.icon}
                 </div>
                 <p className="text-sm font-medium text-slate-300 leading-relaxed">{insight.text}</p>
               </div>
             ))}
           </div>
           <button className="w-full py-4 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/5 transition-all">Ver Todos os Insights</button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold mb-8">Fluxo de Caixa Mensal</h3>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={[{n: 'Sem 1', v: 45000}, {n: 'Sem 2', v: 38000}, {n: 'Sem 3', v: 52000}, {n: 'Sem 4', v: 48000}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="v" fill="#0057FF" radius={[8, 8, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
