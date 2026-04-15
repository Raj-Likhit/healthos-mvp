'use client';

import { Cpu, Database, User, Activity, Clock, ChevronDown, Ambulance, Shield, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { translations } from '@/lib/translations';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthStore } from '@/lib/store';
import ThemeToggle from './ThemeToggle';

export default function StatusBar() {
  const { userRole, systemMetrics, setRole, addToast, language, setLanguage } = useHealthStore();
  const router = useRouter();
  const [time, setTime] = useState<string>('--:--');
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-10 border-b border-border bg-card/70 backdrop-blur-xl z-[100] flex items-center justify-between px-6 select-none">
      {/* Left: System Health */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
            <div className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full ${
              systemMetrics.ai_status === 'online' ? 'bg-primary' :
              systemMetrics.ai_status === 'degraded' ? 'bg-warning' : 'bg-destructive'
            } animate-pulse shadow-[0_0_8px] ${
              systemMetrics.ai_status === 'online' ? 'shadow-primary/50' :
              systemMetrics.ai_status === 'degraded' ? 'shadow-warning/50' : 'shadow-destructive/50'
            }`} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{translations[language].ai_core}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Database className="w-3.5 h-3.5 text-muted-foreground" />
            <div className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full ${
              systemMetrics.db_status === 'connected' ? 'bg-primary' :
              systemMetrics.db_status === 'syncing' ? 'bg-warning' : 'bg-destructive'
            } animate-pulse shadow-[0_0_8px] ${
              systemMetrics.db_status === 'connected' ? 'shadow-primary/50' :
              systemMetrics.db_status === 'syncing' ? 'shadow-warning/50' : 'shadow-destructive/50'
            }`} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{translations[language].db_sync}</span>
        </div>

        <div className="h-4 w-px bg-border/50" />

        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground tabular-nums">
          <Activity className="w-3 h-3" />
          <span>{systemMetrics.latency}{translations[language].latency}</span>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <AnimatePresence>
          {userRole && (
            <div className="relative">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 px-3 py-1 bg-primary/5 border ${isMenuOpen ? 'border-primary' : 'border-primary/20'} rounded-full hover:bg-primary/10 transition-colors group`}
              >
                <User className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  {userRole === 'Citizen' ? translations[language].role_label_citizen : 
                   userRole === 'Responder' ? translations[language].role_label_responder : 
                   userRole === 'Admin' ? translations[language].role_label_admin : userRole}
                </span>
                <ChevronDown className={`w-3 h-3 text-primary transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsMenuOpen(false)}
                      className="fixed inset-0 z-[-1]"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-1.5"
                    >
                      <p className="px-3 py-2 text-[8px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50 mb-1">
                        {translations[language].switch_tactical}
                      </p>
                      
                      {[
                        { id: 'Citizen', label: translations[language].citizen_sos, icon: Activity, href: '/citizen' },
                        { id: 'Responder', label: translations[language].responder_hud, icon: Ambulance, href: '/responder' },
                        { id: 'Admin', label: translations[language].command_hub, icon: Shield, href: '/dashboard' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setRole(item.id as any);
                            router.push(item.href);
                            setIsMenuOpen(false);
                            addToast({ message: `${translations[language].accessing_prefix}${item.label}`, type: 'clinical' });
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                            userRole === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <item.icon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                        </button>
                      ))}

                      <div className="h-px bg-border/50 my-1" />
                      
                      <button
                        onClick={() => {
                          setRole(null);
                          router.push('/');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{translations[language].logout_session}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Time / Theme / Status */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
          className="flex items-center gap-1.5 px-2 py-1 bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-all group"
          title="Toggle Language / భాష మార్చండి"
        >
          <span className={`text-[10px] font-black ${language === 'en' ? 'text-primary' : 'text-muted-foreground'}`}>EN</span>
          <span className="w-px h-2.5 bg-border/50" />
          <span className={`text-[10px] font-black ${language === 'te' ? 'text-primary' : 'text-muted-foreground'}`}>తె</span>
        </button>

        <div className="scale-75 origin-right">
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 px-2 py-0.5 bg-secondary/50 rounded-md border border-border/50">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-bold tabular-nums text-foreground tracking-wider">
            {time}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
           <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60">{translations[language].live_status}</span>
        </div>
      </div>
    </div>
  );
}
