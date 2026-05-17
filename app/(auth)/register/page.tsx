'use client';

import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User,
  Mail, 
  Lock, 
  ArrowRight, 
  Building2,
  Phone,
  CheckCircle2,
  Upload,
  X
} from 'lucide-react';
import { useState, useRef } from 'react';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pharmacyName: '',
    password: '',
    confirmPassword: ''
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length > 6) score += 1;
    if (pass.length > 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthColor = strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-yellow-500' : 'bg-green-500';
  const strengthText = strength <= 2 ? 'Fraca' : strength <= 4 ? 'Média' : 'Forte';

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step < 2) setStep(2);
    else {
      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
      setIsLoading(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--color-blue-100),_transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl flex bg-white rounded-[40px] overflow-hidden shadow-3xl shadow-blue-500/10 border border-slate-100"
      >
        {/* Left Side: Illustration & Value Prop */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-blue p-12 text-white relative">
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-12">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-blue font-bold text-xl skew-x-[-10deg]">
                M
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                MaxCloud
              </span>
            </Link>
            <h2 className="text-4xl font-display font-bold leading-tight mb-8 italic italic">Aumente as vendas com tecnologia e estratégia inteligente!</h2>
            <div className="space-y-6">
              {[
                "Atendimento rápido no WhatsApp",
                "IA Nanda treinada em farmacologia",
                "CRM com histórico do cliente",
                "Campanhas automatizadas",
                "Integração com seu estoque (ERP)"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-300" />
                  <span className="text-lg font-medium text-blue-50">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 p-8 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10">
             <p className="text-sm font-bold opacity-80 mb-2 uppercase tracking-[0.2em]"></p>
             <p className="text-lg font-medium italic">&quot;Não fique para trás enquanto outras farmácias evoluem.
Digitalize seu atendimento, automatize suas vendas e veja seu faturamento crescer.&quot;</p>
             <p className="mt-4 font-bold">&mdash; Comece agora e transforme sua farmácia em uma máquina de vendas!</p>
          </div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-10 flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-display font-bold text-slate-900 mb-1">Crie sua conta</h1>
               <p className="text-slate-500 font-medium tracking-tight">Passo {step} de 2</p>
            </div>
            <div className="w-32">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 1 ? 'text-brand-blue' : 'text-slate-400'}`}>Perfil</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 2 ? 'text-brand-blue' : 'text-slate-400'}`}>Negócio</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "50%" }}
                  animate={{ width: step === 1 ? "50%" : "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="h-full bg-brand-blue shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleNext} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {error}
              </motion.div>
            )}
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Seu Nome Completo</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required 
                        placeholder="Paulo Alves" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">E-mail Corporativo</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                        placeholder="contato@farmacia.com" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Telefone WhatsApp</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required 
                        placeholder="(21) 99999-9999" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="step2"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nome da Farmácia</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" 
                        name="pharmacyName"
                        value={formData.pharmacyName}
                        onChange={handleInputChange}
                        required 
                        placeholder="Drogaria Ltda" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Logo da Farmácia (Opcional)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative h-24 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-brand-blue/40 hover:bg-slate-100/50 transition-all group overflow-hidden"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="hidden" 
                      />
                      {logoPreview ? (
                        <>
                          <Image src={logoPreview} alt="Preview" fill className="object-contain p-2" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogoPreview(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-brand-blue transition-colors">
                          <Upload className="w-6 h-6" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Upload PNG ou JPG</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Senha de Acesso</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required 
                        placeholder="••••••••" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
                      />
                    </div>
                    {formData.password && (
                      <div className="px-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Força da senha</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${strength <= 2 ? 'text-red-500' : strength <= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {strengthText}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div 
                              key={i} 
                              className={`h-full flex-1 transition-all duration-500 ${i <= strength ? strengthColor : 'bg-slate-100'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Confirmar Senha</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
                        <Lock className="w-5 h-5" />
                       </div>
                      <input 
                        type="password" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required 
                        placeholder="••••••••" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4 flex flex-col gap-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 1 ? 'Próximo Passo' : 'Finalizar Cadastro'} 
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              {step === 2 && (
                <button type="button" onClick={() => { setStep(1); setError(null); }} className="text-slate-400 font-bold hover:text-slate-600 transition-colors">Voltar</button>
              )}
            </div>
          </form>

          <p className="text-center mt-8 text-slate-500 font-medium">
            Já tem conta? <Link href="/login" className="text-brand-blue font-bold hover:underline">Fazer Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
