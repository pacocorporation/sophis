'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, ShoppingCart, Users, Zap, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    icon: <MessageSquare className="w-4 h-4" />,
    iconBg: 'bg-blue-500',
    title: 'Nova mensagem no Chat',
    description: 'Cliente João Silva enviou uma mensagem.',
    time: 'Agora',
    read: false,
  },
  {
    id: '2',
    icon: <Users className="w-4 h-4" />,
    iconBg: 'bg-green-500',
    title: 'Novo lead cadastrado',
    description: 'Maria Souza foi adicionada ao CRM.',
    time: '5 min atrás',
    read: false,
  },
  {
    id: '3',
    icon: <Zap className="w-4 h-4" />,
    iconBg: 'bg-purple-500',
    title: 'Automação executada',
    description: 'Fluxo "Boas-vindas" disparado com sucesso.',
    time: '22 min atrás',
    read: false,
  },
  {
    id: '4',
    icon: <ShoppingCart className="w-4 h-4" />,
    iconBg: 'bg-orange-500',
    title: 'Pedido concluído',
    description: 'Pedido #4821 foi marcado como entregue.',
    time: '1h atrás',
    read: true,
  },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-600 transition-all"
        aria-label="Notificações"
      >
        <motion.div
          animate={open ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Bell className="w-5 h-5" />
        </motion.div>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-bold text-slate-800">Notificações</span>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} novas
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] text-blue-500 font-semibold hover:text-blue-700 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todas
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              <AnimatePresence initial={false}>
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-10 flex flex-col items-center gap-2 text-slate-400"
                  >
                    <Bell className="w-8 h-8 opacity-30" />
                    <p className="text-xs font-medium">Nenhuma notificação</p>
                  </motion.div>
                ) : (
                  notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-xl ${n.iconBg} text-white flex items-center justify-center mt-0.5`}>
                        {n.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold text-slate-800 leading-snug ${!n.read ? 'text-slate-900' : ''}`}>
                          {n.title}
                          {!n.read && <span className="inline-block ml-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full align-middle" />}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{n.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{n.time}</p>
                      </div>

                      {/* Dismiss */}
                      <button
                        onClick={() => dismiss(n.id)}
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all mt-0.5"
                        aria-label="Dispensar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-2.5">
                <button
                  onClick={() => setNotifications([])}
                  className="w-full text-[11px] text-slate-400 hover:text-slate-600 font-medium transition-colors text-center"
                >
                  Limpar todas
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
