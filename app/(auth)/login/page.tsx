'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  ArrowRight,
  Chrome
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: `${username.toLowerCase()}@sophis.intern`,
        password,
      });

      if (authError) {
        setError(authError.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : authError.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--color-blue-50),_transparent_50%)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-xl relative overflow-hidden group-hover:scale-110 transition-transform flex-shrink-0">
              <Image
                src="/logo_max.png"
                alt="Drogaria Max"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">
              Drogaria<span className="text-brand-red">Max</span>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Nanda<span className="text-brand-blue">Cloud</span></h1>
          <p className="text-slate-500">Bem-vindo de volta.</p>
          <p className="text-slate-200">Acesse sua plataforma.</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-2xl shadow-blue-500/5">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> {error}
            </motion.div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Usuário</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu nome de usuário"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-slate-700">Senha</label>
                <Link href="#" className="text-xs font-bold text-brand-blue hover:underline">Esqueceu a senha?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" className="rounded-md border-slate-200 text-brand-blue focus:ring-brand-blue" suppressHydrationWarning />
              <span className="text-sm text-slate-500 font-medium">Lembrar acesso</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Entrar na Conta <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-300">
              <span className="bg-white px-4">Ou continue com</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <button className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-sm text-slate-600">
              <Chrome className="w-4 h-4" /> Google
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 font-medium">
          Ainda não tem conta? <Link href="/register" className="text-brand-blue font-bold hover:underline">Crie uma conta</Link>
        </p>
      </motion.div>
    </div>
  );
}



