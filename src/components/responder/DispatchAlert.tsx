'use client';

import { useHealthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Ambulance, MapPin, AlertCircle, Check, X, Clock, Navigation, Phone, User } from 'lucide-react';
import { translations } from '@/lib/translations';

export default function DispatchAlert() {
  const { activeEmergency, updateEmergencyStatus, addToast, language } = useHealthStore();

  if (!activeEmergency || activeEmergency.status !== 'PENDING') return null;

  const handleAccept = () => {
    updateEmergencyStatus('ACCEPTED');
    addToast({
      message: translations[language].mission_accepted,
      type: 'success'
    });
  };

  const handleDecline = () => {
    updateEmergencyStatus('REJECTED');
    addToast({
      message: translations[language].dispatch_declined,
      type: 'warning'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 100 }}
      className="fixed inset-x-4 bottom-8 z-[2000] max-w-lg mx-auto"
    >
      <div className="bg-card border border-primary/30 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Urgent Header */}
        <div className="bg-primary px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3 text-primary-foreground">
            <div className="p-2 bg-white/20 rounded-xl">
              <Ambulance className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{translations[language].new_dispatch}</p>
              <h3 className="text-lg font-black tracking-tight">{translations[language].immediate_response}</h3>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-primary-foreground/60 uppercase">{translations[language].priority_label}</span>
             <span className="text-sm font-black text-primary-foreground">{translations[language][(activeEmergency.priority + '_SEVERITY') as keyof typeof translations['en']] || activeEmergency.priority}</span>
          </div>
        </div>

        {/* 5 W's Content */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{translations[language].what_label}</p>
              <p className="text-sm font-bold text-foreground truncate">{activeEmergency.extraction.what}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{translations[language].where_label}</p>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-primary" />
                {activeEmergency.extraction.where}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{translations[language].who_label}</p>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <User className="w-3 h-3 text-primary" />
                {activeEmergency.extraction.who}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{translations[language].distance_label}</p>
              <p className="text-sm font-bold text-foreground">{translations[language].distance_time_mock}</p>
            </div>
          </div>

          {/* AI Analysis Excerpt */}
          <div className="p-5 rounded-2xl bg-secondary/30 border border-border">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
               <AlertCircle className="w-3 h-3" /> {translations[language].clinical_context}
            </p>
            <p className="text-xs font-medium text-foreground/80 italic leading-relaxed">
              "{activeEmergency.extraction.why} - {activeEmergency.extraction.how}"
            </p>
          </div>

          {/* Interaction Grid */}
          <div className="grid grid-cols-2 gap-4">
             <button
               onClick={handleDecline}
               className="py-5 rounded-2xl bg-secondary text-foreground text-xs font-black uppercase tracking-widest border border-border hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
             >
               <X className="w-4 h-4" /> {translations[language].decline}
             </button>
             <button
               onClick={handleAccept}
               className="py-5 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
             >
               <Check className="w-4 h-4" /> {translations[language].accept_task}
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
