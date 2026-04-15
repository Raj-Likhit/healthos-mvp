'use client';

import { useState, useEffect, useRef } from 'react';
import { processHealthRequest } from '@/lib/orchestrator';
import { useHealthStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, Cpu, Database, AlertCircle, CheckCircle2, FileText, Loader2, Sparkles, User, ShieldCheck, Activity } from 'lucide-react';

export default function OrchestrationTerminal() {
  const [input, setInput] = useState('');
  const { language, logs, isProcessing, error, addLog, setProcessing, setError, processResponse, clearLogs, recordSurveillanceEvent } = useHealthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    let userMsg = input;
    let patientId: string | undefined = undefined;

    const idMatch = input.match(/^id:(\S+)\s+(.*)/i);
    if (idMatch) {
      patientId = idMatch[1];
      userMsg = idMatch[2];
    }

    setInput('');
    setProcessing(true);
    setError(null);
    addLog({ 
      type: 'user', 
      content: patientId ? `[IDENTITY: ${patientId}] ${userMsg}` : userMsg 
    });

    try {
      const response = await processHealthRequest('SESSION_HACKATHON_DEMO', userMsg, patientId);
      processResponse(response);

      if (response.data?.geofence && response.data?.symptoms) {
        recordSurveillanceEvent(response.data.geofence, response.data.symptoms);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : translations[language].protocol_failure;
      setError(errorMsg);
      addLog({ type: 'error', content: `${translations[language].fatal_prefix}: ${errorMsg}` });
    } finally {
      setProcessing(false);
    }
  };

  const renderClinicalSummary = (bundle: any) => {
    if (!bundle || !bundle.entry) return null;

    const patient = bundle.entry.find((e: any) => e.resource.resourceType === 'Patient')?.resource;
    const condition = bundle.entry.find((e: any) => e.resource.resourceType === 'Condition')?.resource;
    const allergies = bundle.entry.filter((e: any) => e.resource.resourceType === 'AllergyIntolerance');

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-4 p-5 bg-card border border-border rounded-2xl shadow-sm space-y-4"
      >
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-[0.1em]">{translations[language].clinical_handover}</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            {mounted ? new Date(bundle.timestamp).toLocaleTimeString() : '--:--:--'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm uppercase text-muted-foreground font-bold tracking-wider">{translations[language].patient_profile}</p>
            <p className="text-base font-bold text-foreground">
              {patient?.name?.[0]?.given?.[0]} {patient?.name?.[0]?.family}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              ID: {patient?.id} • DOB: {patient?.birthDate}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">{translations[language].triage_diagnosis}</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              <p className="text-xs font-semibold text-foreground">
                {condition?.code?.text}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-2">{translations[language].clinical_contraindications}</p>
          <div className="flex flex-wrap gap-2">
            {allergies.length > 0 ? allergies.map((a: any, i: number) => (
              <span key={i} className="px-2 py-1 bg-destructive/10 text-destructive rounded-lg text-[10px] font-bold border border-destructive/20">
                {a.resource.code.text}
              </span>
            )) : <span className="text-muted-foreground text-[10px] font-medium italic">{translations[language].no_allergies}</span>}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="card-minimal h-[560px] flex flex-col overflow-hidden relative group">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground uppercase tracking-[0.15em]">{translations[language].clinical_intelligence_title}</h2>
            <p className="text-xs text-muted-foreground font-medium">{translations[language].forensic_pipeline}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={clearLogs}
            className="text-xs text-muted-foreground hover:text-destructive font-bold uppercase transition-colors opacity-0 group-hover:opacity-100"
          >
            {translations[language].clear_thread}
          </button>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/20" />
        </div>
      </div>

      {/* Main Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scroll-smooth scrollbar-hide bg-background/30"
      >
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-4 ${log.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`mt-1 p-2 rounded-xl shrink-0 ${
                log.type === 'user' ? 'bg-primary text-primary-foreground' : 
                log.type === 'error' ? 'bg-destructive/10 text-destructive' :
                'bg-secondary text-secondary-foreground'
              }`}>
                {log.type === 'user' ? <User className="w-3.5 h-3.5" /> : 
                 log.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> :
                 log.type === 'clinical' ? <FileText className="w-3.5 h-3.5" /> :
                 <Cpu className="w-3.5 h-3.5" />}
              </div>

              <div className={`max-w-[85%] space-y-1 ${log.type === 'user' ? 'text-right' : ''}`}>
                {log.type === 'json' ? (
                  <div className="relative group/json">
                    <pre className="p-4 bg-secondary/30 rounded-2xl border border-border text-xs text-muted-foreground overflow-x-auto font-mono scrollbar-hide max-h-40 transition-all hover:border-primary/20">
                      {log.content}
                    </pre>
                  </div>
                ) : log.type === 'clinical' ? (
                  renderClinicalSummary(log.data)
                ) : (
                  <div className={`p-5 rounded-2xl text-base leading-relaxed shadow-sm ${
                    log.type === 'user' ? 'bg-primary text-primary-foreground font-medium' : 
                    log.type === 'os' ? 'bg-card border-l-4 border-l-primary text-foreground font-semibold italic' :
                    log.type === 'error' ? 'bg-destructive/5 text-destructive border border-destructive/10' :
                    'bg-card border border-border text-foreground'
                  }`}>
                    {log.content}
                  </div>
                )}
                
                <span className="text-[9px] text-muted-foreground/60 font-medium px-1">
                  {log.type.toUpperCase()} • {mounted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-4"
          >
            <div className="mt-1 p-2 rounded-xl bg-secondary text-primary shrink-0">
               <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-card border border-dotted border-primary/30 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                 <div className="flex gap-1">
                    {[0.2, 0.4, 0.6].map(d => (
                      <motion.div
                        key={d}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d }}
                        className="h-1 w-1 rounded-full bg-primary"
                      />
                    ))}
                 </div>
                 <span className="text-[11px] text-primary font-bold uppercase tracking-widest">{translations[language].processing_trace}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-card/50 border-t border-border mt-auto">
        <form onSubmit={handleSubmit} className="relative group/input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={translations[language].terminal_placeholder}
            disabled={isProcessing}
            className="w-full bg-secondary/50 border border-border rounded-2xl px-12 py-5 text-base sm:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/input:text-primary">
            <Terminal className="w-5 h-5" />
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        
        <div className="mt-3 flex items-center justify-between px-2">
           <div className="flex items-center gap-4 text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-help">
                <Database className="w-3 h-3" /> {translations[language].emr_connected}
              </span>
              <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-help">
                <Activity className="w-3 h-3" /> {translations[language].bio_link_active}
              </span>
           </div>
           <p className="text-[9px] text-muted-foreground/50 font-medium">{translations[language].press_enter_logic}</p>
        </div>
      </div>
    </div>
  );
}
