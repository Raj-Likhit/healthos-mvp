'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle, ChevronRight, Activity, Volume2 } from 'lucide-react';
import { useHealthStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { EmergencyRecord, Priority } from '@/lib/types';

const severityConfig: Record<Priority, any> = {
  CRITICAL: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', Icon: AlertCircle, pulse: true, glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]' },
  HIGH:     { color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20', Icon: AlertCircle, pulse: false, glow: '' },
  MEDIUM:   { color: 'text-primary',     bg: 'bg-primary/10',     border: 'border-primary/20',   Icon: Clock,       pulse: false, glow: '' },
  LOW:      { color: 'text-muted-foreground', bg: 'bg-secondary/50', border: 'border-border',       Icon: CheckCircle, pulse: false, glow: '' },
};

const AlertItem = React.memo(({ alert, index }: { alert: EmergencyRecord; index: number }) => {
  const { language } = useHealthStore();
  const cfg = severityConfig[alert.priority] || severityConfig.LOW;
  const { Icon } = cfg;

  const displayTime = React.useMemo(() => {
    try {
      return new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  }, [alert.timestamp]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.02)' }}
      role="button"
      aria-label={`Emergency Alert: ${alert.priority} - ${alert.location?.text || 'Unknown Location'}`}
      tabIndex={0}
      className={`relative flex items-start gap-4 p-4 rounded-2xl cursor-pointer group transition-all border ${
        alert.priority === 'CRITICAL' ? `${cfg.border} ${cfg.bg} ${cfg.glow}` : 'border-transparent'
      }`}
    >
      <div className="relative mt-0.5 shrink-0">
        {cfg.pulse && (
          <motion.span
            className="absolute inset-0 rounded-lg bg-destructive/30"
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
          />
        )}
        <div className={`p-2 rounded-xl ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h4 className={`text-sm font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors ${
              alert.priority === 'CRITICAL' ? 'text-destructive italic' : 'text-foreground/90'
            }`}>
            {alert.location?.text || translations[language].point_unknown}
          </h4>
          <span className="text-[10px] font-black tabular-nums py-0.5 px-2 bg-secondary text-muted-foreground/70 rounded-md border border-border/50">
            {displayTime}
          </span>
        </div>

        <div className="flex flex-col gap-2">
           <p className={`text-[11px] font-bold tracking-wide ${cfg.color} flex items-center gap-1.5`}>
             <span className="h-1 w-1 rounded-full bg-current" />
             {(translations[language][(alert.status + '_STATUS') as keyof typeof translations['en']] || alert.status) || translations[language].pending_status} - {alert.extraction?.what || translations[language].analyzing_label}
           </p>
           
           {/* Vocal Biomarkers & Intensity HUD */}
           {alert.vocalBiomarkers && (
             <div className="flex items-center gap-3 py-1 px-2 rounded-lg bg-black/20 border border-white/5 w-fit">
                <div className="flex items-center gap-1">
                   <Volume2 className={`w-3 h-3 ${alert.vocalBiomarkers.stress_detected ? 'text-destructive' : 'text-primary'}`} />
                   <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{translations[language].tone_label} {alert.vocalBiomarkers.tone || translations[language].tone_unknown}</span>
                </div>
                <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(alert.vocalBiomarkers.intensity || 0) * 100}%` }}
                     className={`h-full ${(alert.vocalBiomarkers.intensity || 0) > 0.7 ? 'bg-destructive' : 'bg-primary'}`}
                   />
                </div>
             </div>
           )}
        </div>
      </div>

      {alert.priority === 'CRITICAL' && (
        <motion.div 
          className="absolute left-0 top-3 bottom-3 w-1 bg-destructive rounded-r-full"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
    </motion.div>
  );
});

AlertItem.displayName = 'AlertItem';

export default function SOSFeed() {
  const { language, emergenciesHistory } = useHealthStore();

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <motion.span
              className="absolute inset-0 rounded-full bg-destructive"
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
            />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
          </span>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {translations[language].live_field_triage}
          </h2>
        </div>

        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-secondary text-primary uppercase animate-pulse">
            {emergenciesHistory.length} {translations[language].active_label}
        </span>
      </div>

      <div className="flex-1 overflow-auto space-y-2 pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {emergenciesHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-12">
               <Activity className="w-10 h-10 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">{translations[language].no_alerts}</p>
            </div>
          ) : (
            emergenciesHistory.map((alert, i) => (
              <AlertItem key={alert.id} alert={alert} index={i} />
            ))
          )}
        </AnimatePresence>
      </div>

      <button 
        aria-label="Access archived clinical logs"
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-colors border-t border-border/40 mt-2"
      >
        {translations[language].archive_retrieval}
      </button>
    </div>
  );
}
