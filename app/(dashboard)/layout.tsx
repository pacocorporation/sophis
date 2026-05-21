'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Zap,
  BarChart3,
  Settings,
  Bot,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { StoreProvider, useStore } from '@/hooks/use-store';
import Image from 'next/image';

import { ChatAssistant } from '@/components/chat-assistant';
import { NotificationBell } from '@/components/notification-bell';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, setUser } = useStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard', module: 'Dashboard' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Chat Omnichannel', href: '/chat', module: 'Chat' },
    { icon: <Users className="w-5 h-5" />, label: 'CRM / Leads', href: '/crm', module: 'CRM' },
    { icon: <Zap className="w-5 h-5" />, label: 'Automação', href: '/automation', module: 'Automação' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Relatórios', href: '/reports', module: 'Relatórios' },
    { icon: <Bot className="w-5 h-5" />, label: 'IA Nanda', href: '/ia', module: 'IA Nanda' },
    { icon: <Settings className="w-5 h-5" />, label: 'Configurações', href: '/settings', module: 'Configurações' },
  ];

  // Find the permissions for the currently logged-in user's role
  const userRole = state.roles.find(r =>
    r.name.toLowerCase() === state.user?.role?.toLowerCase()
  );

  const visibleMenuItems = menuItems.filter(item => {
    // Administrador always sees everything
    if (!userRole || state.user?.role?.toLowerCase() === 'administrador') return true;
    const perm = userRole.permissions.find(p => p.module === item.module);
    // Show if access is 'view' or 'full', hide if 'none' or not found
    return perm && perm.access !== 'none';
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-white border-r border-slate-200 flex flex-col z-50 fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 h-24 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl relative overflow-hidden flex-shrink-0">
              <Image
                src={state.user?.logo || '/logo_max.png'}
                alt="Logo"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Nanda<span className="text-brand-blue">Cloud</span>
            </span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Menu Principal</p>
          {visibleMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all group ${pathname === item.href
                  ? 'bg-brand-blue text-white shadow-xl shadow-blue-500/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue'
                }`}
            >
              <span className={pathname === item.href ? 'text-white' : 'text-slate-400 group-hover:text-brand-blue'}>
                {item.icon}
              </span>
              {item.label}
              {pathname === item.href && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="p-6 space-y-4">
          <div className="bg-brand-blue/5 p-4 rounded-2xl">
            <p className="text-xs font-bold text-brand-blue mb-1">IA NANDA Pro</p>
            <p className="text-[10px] text-slate-500 font-medium mb-3">5/10 usuários ativos na licença.</p>
            <button className="w-full bg-brand-blue text-white py-2 rounded-xl text-xs font-bold hover:shadow-lg transition-all">Upgrade Now</button>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-slate-500 font-bold text-sm hover:text-red-500 transition-all w-full"
          >
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden w-full">
        {/* Header */}
        <header className="h-24 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl w-96 border border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Busca global (leads, pedidos, produtos...)" className="bg-transparent border-0 focus:ring-0 text-sm font-medium w-full" />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <NotificationBell />
            <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900">
                  {state.user?.name || <span className="text-slate-400">Carregando...</span>}
                </p>
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1 justify-end">
                  {(state.user?.role?.toLowerCase() === 'administrador' || state.user?.status === 'Admin') ? (
                    <span className="bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                      Administrador
                    </span>
                  ) : (
                    <span>{state.user?.role || state.user?.company || '—'}</span>
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 overflow-hidden ring-2 ring-brand-blue ring-offset-2 relative">
                <Image
                  src={state.user?.image || "/avatar-default.svg"}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          {children}
        </div>

        {/* Chat Assistant */}
        <ChatAssistant />
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <DashboardContent>{children}</DashboardContent>
    </StoreProvider>
  );
}
