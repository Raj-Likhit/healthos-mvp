'use client';

import { useState, useEffect } from 'react';
import { useHealthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Ambulance, Map as MapIcon, Navigation, Phone, MessageSquare, AlertCircle, CheckCircle2, MoreVertical, Send, ShieldAlert } from 'lucide-react';
import dynamic from 'next/dynamic';
import DispatchAlert from '@/components/responder/DispatchAlert';
import { translations } from '@/lib/translations';

const TacticalMap = dynamic(() => import('@/components/responder/TacticalMap'), { 
  ssr: false,
  loading: () => {
    const { language } = useHealthStore.getState();
    return (
      <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
         <div className="animate-pulse flex flex-col items-center gap-4">
            <MapIcon className="w-12 h-12 text-primary/20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">{translations[language].initializing_grid}</p>
         </div>
      </div>
    );
  }
});

export default function ResponderPage() {
  const { activeEmergency, updateEmergencyStatus, language, setLanguage } = useHealthStore();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur-md flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Ambulance className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-foreground">{translations[language].unit_label}</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{activeEmergency?.status === 'ACCEPTED' ? translations[language].status_executing : translations[language].status_standby}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 border border-border rounded-full transition-all group hover:bg-secondary"
            title="Toggle Language / భాష మార్చండి"
          >
            <span className={`text-[10px] font-black ${language === 'en' ? 'text-primary' : 'text-muted-foreground'}`}>EN</span>
            <span className="w-px h-2.5 bg-border/50" />
            <span className={`text-[10px] font-black ${language === 'te' ? 'text-primary' : 'text-muted-foreground'}`}>తె</span>
          </button>

          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                U{i}
              </div>
            ))}
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Real Tactical Map Integrated */}
        <div className="absolute inset-0 z-0">
          <TacticalMap />
        </div>

        {/* Mission Control UI */}
        <div className="relative z-10 flex-1 flex flex-col p-6 pointer-events-none">
          <AnimatePresence>
            {activeEmergency?.status === 'ACCEPTED' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-md space-y-4 pointer-events-auto"
              >
                {/* Active Mission Details */}
                <div className="card-minimal overflow-hidden border-primary/20">
                  <div className="p-5 bg-primary/5 border-b border-primary/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary">{translations[language].active_mission}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">#M-{activeEmergency.id}</span>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                       <div>
                         <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{translations[language].target_desc}</p>
                         <h2 className="text-lg font-black leading-tight">{activeEmergency.extraction.what}</h2>
                       </div>
                       
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-secondary/50 rounded-2xl border border-border">
                             <Navigation className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">{translations[language].dest_landmarks}</p>
                            <p className="text-sm font-bold">{activeEmergency.extraction.where}</p>
                          </div>
                       </div>
                    </div>

                    <div className="h-px bg-border/50" />

                    <div className="grid grid-cols-2 gap-4">
                       <button className="flex items-center justify-center gap-2 py-4 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-black uppercase transition-all">
                          <Phone className="w-3.5 h-3.5" /> {translations[language].call_dispatch}
                       </button>
                       <button className="flex items-center justify-center gap-2 py-4 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-black uppercase transition-all">
                          <MessageSquare className="w-3.5 h-3.5" /> {translations[language].live_thread}
                       </button>
                    </div>
                  </div>
                </div>

                {/* AI Rationale for Responder */}
                <div className="p-5 rounded-[2rem] bg-card/80 backdrop-blur-md border border-border flex items-start gap-4 shadow-xl">
                  <div className="mt-1 p-2 bg-primary/10 rounded-xl text-primary">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">{translations[language].en_route_protocol}</p>
                    <p className="text-xs font-medium text-foreground/80 italic">
                      "{activeEmergency.extraction.why}. {translations[language].priority_status_label}{activeEmergency.priority}."
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Incoming Dispatch Overlay Component */}
          <DispatchAlert />
        </div>
      </main>

      {/* Footer Status */}
      <footer className="px-6 py-3 border-t border-border bg-card/30 text-[9px] font-bold text-muted-foreground uppercase flex justify-between tracking-widest">
        <span>{translations[language].encrypted_channel}</span>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary" />
          {translations[language].data_link_active}
        </div>
      </footer>
    </div>
  );
}
