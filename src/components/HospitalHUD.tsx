'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useHealthStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Hospital } from '@/lib/types';
import { Activity, MapPin, RefreshCw, Pill, Building2, Crosshair } from 'lucide-react';
import { SkeletonCard } from './SkeletonCard';

/* ── 3-D tilt card wrapper ── */
function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 20 });
  const sy = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-4, 4]);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

const HospitalCard = React.memo(({ hospital, index }: { hospital: Hospital; index: number }) => {
  const { language } = useHealthStore();
  const statusConfig = {
    OPEN:          { color: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500', border: 'border-emerald-500/20' },
    LOW:           { color: 'text-amber-500',   bg: 'bg-amber-500/10',   dot: 'bg-amber-500',   border: 'border-amber-500/20'   },
    CRITICAL_LOAD: { color: 'text-rose-500',    bg: 'bg-rose-500/10',    dot: 'bg-rose-500',    border: 'border-rose-500/20'    },
  };

  const config = statusConfig[hospital.status as keyof typeof statusConfig] ?? statusConfig.OPEN;
  const isCritical = hospital.status === 'CRITICAL_LOAD';

  return (
    <TiltCard>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -3 }}
        className="card-minimal p-4 flex justify-between items-center group cursor-default relative overflow-hidden"
      >
        <div className="flex items-center gap-4">
          <motion.div
            className={`h-12 w-12 flex items-center justify-center rounded-2xl ${config.bg} border ${config.border}`}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {hospital.type === 'CLINIC' ? (
              <Building2 className={`w-5 h-5 ${config.color}`} />
            ) : (
              <Activity className={`w-5 h-5 ${config.color}`} />
            )}
          </motion.div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight leading-tight uppercase">
                {hospital.name}
              </h3>
              <span className="text-[8px] font-black px-2 py-0.5 bg-primary/20 text-primary rounded-full uppercase tracking-widest">
                {hospital.type === 'CLINIC' ? translations[language].CLINIC_TYPE : (translations[language][hospital.type as keyof typeof translations['en']] || hospital.type)}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              <MapPin className="w-3 h-3" />
              {hospital.location?.text || translations[language].location_pending}
            </div>

            <div className="flex flex-wrap gap-1 mt-1">
              {hospital.capabilities?.slice(0, 3).map(cap => (
                <span key={cap} className="text-[8px] font-black border border-border px-1.5 py-0.5 rounded-md bg-secondary/30 text-muted-foreground uppercase">
                  {cap}
                </span>
              )) || (
                <span className="text-[8px] font-bold text-muted-foreground/40 italic">{translations[language].no_capabilities}</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-3">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[8px] font-black uppercase text-muted-foreground/50 mb-0.5">{translations[language].beds_label}</p>
              <p className={`text-xs font-black tabular-nums ${ (hospital.inventory?.beds || 0) > 0 ? 'text-foreground' : 'text-destructive'}`}>
                {hospital.inventory?.beds ?? '--'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black uppercase text-muted-foreground/50 mb-0.5">{translations[language].meds_label}</p>
              <p className="text-xs font-black tabular-nums text-primary">
                {hospital.inventory?.medicines?.length ?? 0}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} border ${config.border}`}>
            <span className={`h-1 w-1 rounded-full ${config.dot} ${isCritical ? 'animate-ping' : ''}`} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${config.color}`}>
              {translations[language][(hospital.status + '_STATUS') as keyof typeof translations['en']] || hospital.status}
            </span>
          </div>
        </div>
      </motion.div>
    </TiltCard>
  );
});

HospitalCard.displayName = 'HospitalCard';

export default function HospitalHUD() {
  const { hospitals, resetHospitals, language } = useHealthStore();
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-primary" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {translations[language].regional_medical_nodes}
          </h2>
        </div>
        <button 
          onClick={resetHospitals} 
          aria-label="Synchronize regional medical node data"
          className="text-[10px] font-bold text-muted-foreground/40 hover:text-primary transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> {translations[language].sync_label}
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {isHydrating ? (
            <motion.div
              key="skeletons"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} className="h-[120px]" />
              ))}
            </motion.div>
          ) : (
            hospitals.map((hospital, index) => (
              <HospitalCard key={hospital.id} hospital={hospital} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
