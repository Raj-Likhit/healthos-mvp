'use client';

import { useHealthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ToastProvider() {
  const { toasts, removeToast } = useHealthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

const TOAST_CONFIG = {
  success: { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
  error: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/5', border: 'border-destructive/20' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/20' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
  clinical: { icon: FileText, color: 'text-primary', bg: 'bg-card', border: 'border-primary/40' },
};

function ToastItem({ toast, onRemove }: { toast: any; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const config = TOAST_CONFIG[toast.type as keyof typeof TOAST_CONFIG] || TOAST_CONFIG.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto relative group overflow-hidden p-4 rounded-2xl border ${config.border} ${config.bg} backdrop-blur-md shadow-xl`}
    >
      <div className="flex gap-4">
        <div className={`shrink-0 p-2 rounded-xl bg-background/50 border ${config.border} ${config.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 pt-1">
          <p className="text-sm font-bold text-foreground leading-tight">
            {toast.message}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-2">
            Protocol: {toast.type.toUpperCase()}
          </p>
        </div>

        <button 
          onClick={() => onRemove(toast.id)}
          className="shrink-0 p-1 h-fit text-muted-foreground/40 hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-0.5 ${config.color.replace('text', 'bg')} opacity-30`}
      />
    </motion.div>
  );
}
