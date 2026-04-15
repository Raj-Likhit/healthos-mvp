'use client';

import { useHealthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, MapPin, Clock, ArrowRight, Ambulance, AlertCircle } from 'lucide-react';
import VoiceAgent from '@/components/citizen/VoiceAgent';
import { useEffect, useState } from 'react';
import { translations } from '@/lib/translations';

export default function CitizenPage() {
  const { activeEmergency, theme, language, setLanguage } = useHealthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 sm:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-foreground">HealthOS</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{translations[language].role_citizen}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 border border-border rounded-full transition-all group hover:bg-secondary"
            title="Toggle Language / భాష మార్చండి"
          >
            <span className={`text-[10px] font-black ${language === 'en' ? 'text-primary' : 'text-muted-foreground'}`}>EN</span>
            <span className="w-px h-2.5 bg-border/50" />
            <span className={`text-[10px] font-black ${language === 'te' ? 'text-primary' : 'text-muted-foreground'}`}>తె</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{translations[language].live_pipeline}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center gap-12">
        <AnimatePresence mode="wait">
          {!activeEmergency ? (
            <motion.div
              key="voice-trigger"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
                  {translations[language].help_one_word.split('One Word')[0]} <br/><span className="text-primary italic">{language === 'en' ? 'One Word' : 'ఒకే ఒక్క మాట'}</span> {translations[language].help_one_word.split('One Word')[1]}
                </h2>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                  {translations[language].help_desc}
                </p>
              </div>

              <VoiceAgent />

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col items-center gap-2 text-center">
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{translations[language].triage_monitor}</span>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col items-center gap-2 text-center">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{translations[language].auto_location}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="status-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 max-w-md mx-auto w-full"
            >
              {/* Emergency Status Card */}
              <div className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden">
                <motion.div 
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent)]"
                />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <Ambulance className="w-8 h-8" />
                    </div>
                    <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {activeEmergency.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tight">{translations[language].help_dispatching}</h3>
                    <p className="text-primary-foreground/70 font-medium">{translations[language].ambulance_eta}</p>
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl">
                       <Clock className="w-4 h-4 mb-2" />
                       <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{translations[language].status}</p>
                       <p className="text-sm font-black">{translations[language].en_route}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                       <MapPin className="w-4 h-4 mb-2" />
                       <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{translations[language].facility}</p>
                       <p className="text-sm font-black truncate">City General</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Follow-up */}
              <div className="p-6 rounded-3xl bg-secondary/30 border border-border space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">{translations[language].follow_protocols}</span>
                </div>
                <div className="space-y-3">
                  {[translations[language].protocol_1, translations[language].protocol_2, translations[language].protocol_3].map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="h-6 w-6 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 text-[10px] font-bold">
                        {i + 1}
                      </div>
                      <p className="text-sm font-medium text-foreground/80">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => useHealthStore.getState().clearActiveEmergency()}
                className="w-full py-5 rounded-2xl bg-secondary text-foreground text-xs font-black uppercase tracking-widest border border-border hover:bg-secondary/80 transition-all"
              >
                {translations[language].safe_to_close}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto py-8 text-center">
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
          {translations[language].ecosystem_footer}
        </p>
      </footer>
    </div>
  );
}
