'use client';

import { useHealthStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Activity, Map, Radio, ShieldAlert, History, Siren } from 'lucide-react';

export default function SurveillanceHUD() {
  const { language, surveillanceAlerts, recordedEvents, clearSurveillance } = useHealthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeAlerts = useMemo(() => surveillanceAlerts, [surveillanceAlerts]);
  const recentEvents = useMemo(() => 
    [...recordedEvents].reverse().slice(0, 5), 
    [recordedEvents]
  );

  return (
    <div className="card-minimal p-6 space-y-6 overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">
              {translations[language].biosurveillance_monitor}
            </h3>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
              <Activity className="h-3 w-3 text-primary" /> 
              {translations[language].scanning_label} {recordedEvents.length} {translations[language].ingestion_points}
            </p>
          </div>
        </div>

        <motion.button 
          onClick={clearSurveillance}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors uppercase tracking-wider"
        >
          {translations[language].purge_history}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ring-1 ring-border rounded-xl p-1 bg-secondary/30">
        {/* Alerts Section */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" /> {translations[language].active_clusters}
            </p>
            <span className="text-xs font-bold text-primary/60 font-mono">
              {translations[language].threshold_label}: 5_{translations[language].pts_mock}
            </span>
          </div>
          
          <div className="space-y-3 min-h-[220px]">
            <AnimatePresence mode="popLayout">
              {activeAlerts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 opacity-40 grayscale"
                >
                  <Map className="h-8 w-8 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground font-medium italic">{translations[language].zone_monitoring_nominal}</p>
                </motion.div>
              ) : (
                activeAlerts.map((alert) => (
                  <motion.div
                    key={`${alert.geofence}`}
                    layout
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="p-4 border border-destructive/20 bg-destructive/5 rounded-xl space-y-3 group hover:border-destructive/40 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                           <Siren className="h-4 w-4 text-destructive" />
                           <p className="text-sm font-bold text-foreground">{alert.geofence}</p>
                        </div>
                        <span className="text-[10px] font-bold text-destructive/80 uppercase tracking-widest px-2 py-0.5 bg-destructive/10 rounded">
                          {translations[language][alert.type] || alert.type}
                        </span>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 bg-destructive text-destructive-foreground font-bold rounded-lg uppercase">
                        {translations[language][(alert.severity + '_SEVERITY') as keyof typeof translations['en']] || alert.severity}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {alert.symptoms.map(s => (
                        <span key={s} className="text-xs px-2.5 py-1 bg-destructive/10 text-destructive font-bold rounded-lg uppercase border border-destructive/10">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 flex flex-col gap-1.5">
                       <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                         <span className="text-muted-foreground">{translations[language].density_label}</span>
                         <span className="text-destructive">{alert.hit_count} {translations[language].hits_label}</span>
                       </div>
                       <div className="h-1.5 w-full bg-destructive/20 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(alert.hit_count * 10, 100)}%` }}
                            className="h-full bg-destructive" 
                          />
                       </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live Ticker Section */}
        <div className="p-4 bg-card rounded-r-xl border-l border-border space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> {translations[language].live_ticker}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
              <span className="text-xs font-bold text-primary uppercase">{translations[language].syncing_label}</span>
            </div>
          </div>

          <div className="space-y-4 h-[220px] overflow-hidden relative">
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none z-10" />
            
            <AnimatePresence initial={false} mode="popLayout">
              {recentEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 opacity-30">
                  <Activity className="h-6 w-6 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground font-mono">{translations[language].awaiting_telemetry}</p>
                </div>
              ) : (
                recentEvents.map((event, i) => (
                  <motion.div
                    key={`${event.timestamp}-${i}`}
                    initial={{ y: -10, opacity: 0, scale: 0.98 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    className="flex justify-between items-start p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex flex-col gap-1 pr-4 min-w-0">
                      <span className="text-xs text-primary font-bold uppercase tracking-tight truncate">{event.geofence}</span>
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {event.symptoms.join(', ')}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold font-mono tabular-nums whitespace-nowrap">
                      {mounted ? new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
