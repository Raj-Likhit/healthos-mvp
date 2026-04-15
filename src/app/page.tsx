'use client';

import { useHealthStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Shield, Ambulance, Activity, ArrowRight, Sparkles, Cpu, Globe, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { translations } from '@/lib/translations';

export default function LandingPage() {
  const { userRole, language } = useHealthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If we land here and have a role, we should probably just show the relevant dashboard entry
  }, []);

  if (!mounted) return null;

  const roleTitle = userRole === 'Citizen' ? translations[language].dashboard_title_citizen : 
                    userRole === 'Responder' ? translations[language].dashboard_title_responder : 
                    translations[language].dashboard_title_admin;

  const roleHref = userRole === 'Citizen' ? '/citizen' : 
                   userRole === 'Responder' ? '/responder' : 
                   '/dashboard';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] opacity-5" />
        <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] w-full h-full opacity-10">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-border/20 aspect-square" />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="p-4 bg-primary/10 rounded-3xl border border-primary/20 text-primary mb-4 shadow-2xl shadow-primary/20">
            <Shield className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tight italic">
              Health<span className="text-primary not-italic">OS</span> {translations[language].system_core}
            </h1>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
              <Lock className="w-3 h-3" /> {translations[language].encrypted_session}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-10 rounded-[3rem] bg-card border border-border shadow-2xl relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">{translations[language].signed_in_as}</p>
              <h2 className="text-2xl font-black text-foreground">{roleTitle}</h2>
            </div>

            <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
              {translations[language].deployment_profile_verified}
            </p>

            <button 
              onClick={() => router.push(roleHref)}
              className="w-full flex items-center justify-center gap-3 py-6 rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
            >
              {translations[language].enter_dashboard} <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              onClick={() => {
                useHealthStore.getState().setRole(null);
                router.push('/');
              }}
              className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-colors"
            >
              {translations[language].switch_ecosystem}
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-8"
        >
          <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            <Cpu className="w-3 h-3" /> {translations[language].core_version}
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            <Globe className="w-3 h-3" /> {translations[language].global_node}
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> {translations[language].ai_ready}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
