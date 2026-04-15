'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBar from '@/components/StatusBar';
import OrchestrationTerminal from '@/components/OrchestrationTerminal';
import HospitalHUD from '@/components/HospitalHUD';
import SurveillanceHUD from '@/components/SurveillanceHUD';
import SOSFeed from '@/components/SOSFeed';
import MedicineManager from '@/components/hospital/MedicineManager';
import ClinicalErrorBoundary from '@/components/ClinicalErrorBoundary';
import { Shield, LayoutDashboard, Activity, Terminal as TerminalIcon, Pill, Boxes } from 'lucide-react';
import { useHealthStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function DashboardPage() {
  const { language } = useHealthStore();
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'inventory'>('terminal');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 sm:p-6 gap-6 overflow-hidden">
      {/* Top Navigation / Status */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground uppercase tracking-widest leading-none">
              {translations[language].command_center}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                 {translations[language].local_node}
               </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-secondary/30 p-1 rounded-2xl border border-border flex gap-1">
          <button 
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'terminal' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <TerminalIcon className="w-3 h-3" /> {translations[language].orchestrator_tab}
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'inventory' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <Boxes className="w-3 h-3" /> {translations[language].medicine_inventory_tab}
          </button>
        </div>
        
        <StatusBar />
      </header>

      {/* Main Dashboard Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
        
        {/* Left/Middle Column: Content */}
        <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6 overflow-hidden">
           <AnimatePresence mode="wait">
             {activeTab === 'terminal' ? (
               <motion.div 
                 key="terminal"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
                 className="flex flex-col flex-1 h-[75vh]"
               >
                  <div className="flex items-center gap-2 px-2 pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <TerminalIcon className="w-3.5 h-3.5" /> {translations[language].logical_flow_orchestrator}
                  </div>
                  <ClinicalErrorBoundary moduleName="Clinical Orchestrator">
                    <OrchestrationTerminal />
                  </ClinicalErrorBoundary>
               </motion.div>
             ) : (
               <motion.div 
                 key="inventory"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
                 className="flex flex-col flex-1 h-[75vh]"
               >
                  <div className="flex items-center gap-2 px-2 pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <Pill className="w-3.5 h-3.5" /> {translations[language].clinical_stock_manager} (Hospital_001)
                  </div>
                  <div className="flex-1 bg-secondary/10 rounded-[2.5rem] border border-border p-6 overflow-auto">
                    <ClinicalErrorBoundary moduleName="Inventory Manager">
                      <MedicineManager hospitalId="HOSP_001" />
                    </ClinicalErrorBoundary>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Right Column: Infrastructure & Surveillance */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6 h-[75vh] overflow-hidden">
           
           {/* Strategic Surveillance */}
           <div className="space-y-4 shrink-0">
              <div className="flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                 <Shield className="w-3.5 h-3.5" /> {translations[language].critical_surveillance}
              </div>
              <ClinicalErrorBoundary moduleName="Surveillance Node">
                <SurveillanceHUD />
              </ClinicalErrorBoundary>
           </div>

           {/* Hospital Readiness Index */}
           <div className="space-y-4 min-h-[300px] overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                 <Activity className="w-3.5 h-3.5" /> {translations[language].infrastructure_telemetry}
              </div>
              <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                <ClinicalErrorBoundary moduleName="Hospital HUD">
                  <HospitalHUD />
                </ClinicalErrorBoundary>
              </div>
           </div>

           {/* Live Field Triage */}
           <div className="flex-1 overflow-hidden min-h-[150px]">
              <ClinicalErrorBoundary moduleName="SOS Feed">
                <SOSFeed />
              </ClinicalErrorBoundary>
           </div>

        </div>
      </main>

      {/* Global Footer Security Label */}
      <footer className="mt-auto py-4 border-t border-border/40 flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase opacity-40">
        <div className="flex gap-6">
           <span>Session_ID: 0x8F4A...</span>
           <span>{translations[language].protocols_label}</span>
        </div>
        <span>{translations[language].copyright_label}</span>
      </footer>
    </div>
  );
}
