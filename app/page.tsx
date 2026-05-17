'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import {
  Plus,
  ArrowRight,
  MessageSquare,
  Users,
  Bot,
  Zap,
  BarChart3,
  LayoutDashboard,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-xl skew-x-[-10deg]">
              N
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">
              Sophis<span className="text-brand-blue">Cloud</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-slate-600 hover:text-brand-blue transition-colors font-medium">Recursos</Link>
            <Link href="#ia" className="text-slate-600 hover:text-brand-blue transition-colors font-medium">IA Alba</Link>
            <Link href="#crm" className="text-slate-600 hover:text-brand-blue transition-colors font-medium">CRM</Link>
            <Link href="#pricing" className="text-slate-600 hover:text-brand-blue transition-colors font-medium"></Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-slate-700 font-medium hover:text-brand-blue transition-colors">
              Login
            </Link>
            <Link href="/register" className="bg-brand-blue text-white px-6 py-2.5 rounded-full font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95">
              Começar Agora
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3 h-3 fill-current" />
              Sua Farmácia 24h com IA
            </div>
            <h1 className="font-display text-6xl md:text-7xl font-bold leading-[0.9] tracking-tighter mb-8 italic">
              Sua farmácia vendendo <br />
              <span className="text-brand-blue">24h por dia</span> <br />
              com CRM + IA.
            </h1>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg">
              A única plataforma omnichannel que une WhatsApp, CRM e a IA Alba para automatizar atendimentos, ler receitas e explodir suas vendas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
                Criar Minha Conta <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/register" className="bg-slate-100 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                Ver Demo ao Vivo
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6 text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">IA Alba Integrada</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">WhatsApp Omnichannel</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-slate-100 aspect-video">
              <Image
                src="/1.png"
                alt="Dashboard Nanda Cloud"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {/* Floating UI elements for flair */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Novo Lead WhatsApp</p>
                <p className="text-sm font-bold text-slate-900">+ R$ 450,20 sugeridos</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status Alba IA</p>
                <p className="text-sm font-bold text-slate-900">Analisando Receita...</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <p className="text-4xl font-display font-bold text-slate-900 mb-2">+R$ 2B</p>
              <p className="text-slate-500 font-medium">Transacionados</p>
            </div>
            <div>
              <p className="text-4xl font-display font-bold text-slate-900 mb-2">15k+</p>
              <p className="text-slate-500 font-medium">Farmácias</p>
            </div>
            <div>
              <p className="text-4xl font-display font-bold text-slate-900 mb-2">99%</p>
              <p className="text-slate-500 font-medium">Satisfação</p>
            </div>
            <div>
              <p className="text-4xl font-display font-bold text-slate-900 mb-2">24/7</p>
              <p className="text-slate-500 font-medium">Disponibilidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 italic">O sistema que toda farmácia <br /> <span className="text-brand-blue">precisa para escalar.</span></h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">Tudo que você precisa em uma única plataforma, sem integrações complexas.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              title: "CRM Omnichannel",
              desc: "Controle seus leads e clientes vindo do WhatsApp em um pipeline visual organizado.",
              icon: <LayoutDashboard className="w-6 h-6" />,
              color: "bg-blue-500"
            },
            {
              title: "Atendimento Inbox",
              desc: "Centralize todo o atendimento da sua equipe em um único número de WhatsApp profissional.",
              icon: <MessageSquare className="w-6 h-6" />,
              color: "bg-brand-red"
            },
            {
              title: "Vendas via IA",
              desc: "Alba, nossa IA, sugere produtos, resume conversas e ajuda no fechamento.",
              icon: <Bot className="w-6 h-6" />,
              color: "bg-purple-500"
            },
            {
              title: "Automação de Marketing",
              desc: "Dispare campanhas segmentadas e recupere carrinhos abandonados automaticamente.",
              icon: <Zap className="w-6 h-6" />,
              color: "bg-orange-500"
            },
            {
              title: "Dashboard Financeiro",
              desc: "Métricas reais de faturamento, conversão e performance da equipe em tempo real.",
              icon: <BarChart3 className="w-6 h-6" />,
              color: "bg-green-500"
            },
            {
              title: "Multi-Empresa",
              desc: "Gerencie diversas filiais em uma única conta administrativa centralizada.",
              icon: <Users className="w-6 h-6" />,
              color: "bg-slate-800"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl border border-slate-100 hover:border-brand-blue/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5 group"
            >
              <div className={`w-14 h-14 ${feature.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${feature.color.split('-')[1]}-500/20`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* IA Nanda Section */}
      <section id="ia" className="py-32 bg-brand-blue overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <Bot className="w-3 h-3 fill-current" />
                Inteligência Artificial Exclusiva
              </div>
              <h2 className="text-5xl font-display font-bold mb-8 italic italic">Conheça a Alba. <br /> Sua atendente virtual <br /> infalível.</h2>
              <ul className="space-y-6 mb-12">
                {[
                  "Lê e interpreta receitas médicas via OCR",
                  "Sugere produtos complementares para aumentar o ticket",
                  "Detecta intenção de compra e avisa o atendente",
                  "Resume conversas longas em segundos",
                  "consula de estoque ERP farma",
                  "Vende produtos e tira dúvidas"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg font-medium">
                    <CheckCircle2 className="w-6 h-6 text-blue-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/ia" className="bg-white text-brand-blue px-8 py-4 rounded-2xl font-bold text-lg inline-flex items-center gap-2 hover:bg-slate-100 transition-all">
                Explorar IA Alba <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="bg-white p-8 rounded-[40px] shadow-3xl text-slate-900 border-4 border-white/20"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div>
                    <p className="font-bold">Alba IA</p>
                    <p className="text-xs text-brand-blue font-bold tracking-widest uppercase">Online & Atenta</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                    <p className="text-sm font-medium">Olá! Acabei de analisar a sua receita. Ela contém <b>Amoxicilina 500mg</b>. Temos 3 opções disponíveis agora no estoque. Deseja que eu adicione ao carrinho?</p>
                  </div>
                  <div className="bg-brand-blue text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] ml-auto">
                    <p className="text-sm font-medium">Sim, pode adicionar o genérico de melhor preço por favor.</p>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                    <p className="text-sm font-medium">Perfeito! Adicionado. Sugiro também uma Vitamina C para auxiliar na sua recuperação. Temos uma promoção hoje por apenas R$ 12,90. Gostaria?</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[50px] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent pointer-events-none" />
          <h2 className="text-white text-4xl md:text-6xl font-display font-bold mb-8 italic">Pronto para digitalizar sua farmácia?</h2>
          <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto">Junte-se a milhares de drogarias que já usam o SophisCloud para escalar suas vendas no digital.</p>
          <Link href="/register" className="bg-brand-blue text-white px-12 py-6 rounded-3xl font-bold text-2xl inline-flex items-center gap-3 hover:scale-105 transition-transform hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95">
            Começar Grátis Agora <Zap className="w-6 h-6 fill-current" />
          </Link>
          <p className="text-slate-500 mt-8 font-medium">Sem cartão de crédito. Teste por 14 dias.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold skew-x-[-10deg]">
                N
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                Sophis<span className="text-brand-red">Cloud</span>
              </span>
            </div>
            <p className="text-slate-500 max-w-sm font-medium">A plataforma de CRM, Pipeline de Vendas e Atendimento inteligente definitiva para o mercado farmacêutico brasileiro.</p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Plataforma</h4>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-brand-blue">Recursos</Link></li>
              <li><Link href="#" className="hover:text-brand-blue">IA Alba</Link></li>
              <li><Link href="#" className="hover:text-brand-blue">Omnichannel</Link></li>
              <li><Link href="#" className="hover:text-brand-blue">Segurança</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Empresa</h4>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-brand-blue">Sobre Nós</Link></li>
              <li><Link href="#" className="hover:text-brand-blue">Blog</Link></li>
              <li><Link href="#" className="hover:text-brand-blue">Termos</Link></li>
              <li><Link href="#" className="hover:text-brand-blue">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-50 flex flex-col md:row items-center justify-between gap-6">
          <p className="text-slate-400 text-sm">© 2025 SOPHISCloud. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-400 hover:text-brand-blue transition-colors"><Zap className="w-5 h-5" /></Link>
            <Link href="#" className="text-slate-400 hover:text-brand-blue transition-colors"><Bot className="w-5 h-5" /></Link>
            <Link href="#" className="text-slate-400 hover:text-brand-blue transition-colors"><MessageSquare className="w-5 h-5" /></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
