'use client';

import { useHealthStore } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Ambulance, Activity, Sparkles, Fingerprint } from 'lucide-react';
import { translations } from '@/lib/translations';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const router = useRouter();
  const { userRole, setRole, addToast, language } = useHealthStore();

  const ROLES: { id: UserRole; title: string; desc: string; icon: any; href: string }[] = [
    { id: 'Citizen', title: translations[language].citizen_label, desc: translations[language].citizen_desc, icon: Activity, href: '/citizen' },
    { id: 'Responder', title: translations[language].responder_label, desc: translations[language].responder_desc, icon: Ambulance, href: '/responder' },
  ];

  const handleSelect = (role: UserRole, href: string) => {
    setRole(role);
    addToast({
      message: `${translations[language].session_initialized_prefix}${role.toUpperCase()}]`,
      type: 'clinical',
      duration: 3000
    });
    router.push(href);
  };
  
  // If user already has a role, they shouldn't be here. Let them proceed with their normal flow
  useEffect(() => {
    if (userRole === 'Citizen') {
      router.push('/citizen');
    } else if (userRole === 'Responder') {
      router.push('/responder');
    } else if (userRole === 'Admin') {
      router.push('/dashboard');
    }
  }, [userRole, router]);

  return (
    <div className="fixed inset-0 z-[2000] bg-zinc-950 flex items-center justify-center p-6 overflow-y-auto">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      </div>

      <div className="relative w-full max-w-4xl space-y-12 py-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 text-emerald-400 mb-6"
          >
            <div className="p-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-emerald-500/10 border border-emerald-500/20 rounded-2xl glass-premium">
              <Fingerprint className="w-8 h-8" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white italic"
          >
            Health<span className="text-emerald-400 not-italic">OS</span> {translations[language].command_core}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-xs sm:text-sm"
          >
            {translations[language].welcome_desc} • {translations[language].protocol_version}
          </motion.p>
        </div>

        {/* Role Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {ROLES.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(role.id, role.href)}
              className="group relative flex flex-col items-start p-8 glass-premium border-zinc-800 hover:border-emerald-500/50 rounded-[2.5rem] text-left transition-all shadow-xl shadow-black/50 hover:shadow-emerald-500/10 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]"
            >
              <div className="mb-6 p-4 rounded-3xl bg-zinc-900 border border-zinc-800 group-hover:bg-emerald-500 group-hover:border-emerald-400 group-hover:text-emerald-950 text-white transition-colors duration-300">
                <role.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2 italic">
                {role.title}
              </h3>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                {role.desc}
              </p>

              <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {translations[language].access_protocol} <Sparkles className="w-3 h-3" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-8 border-t border-zinc-900/50 space-y-4"
        >
          <button 
            onClick={() => {
              setRole('Admin');
              router.push('/dashboard');
            }}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            {translations[language].orchestrator_label}: {translations[language].orchestrator_desc}
          </button>

          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            {translations[language].security_footer_text}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
