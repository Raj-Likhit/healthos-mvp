'use client';

import HospitalHUD from '@/components/HospitalHUD';
import SOSFeed from '@/components/SOSFeed';
import OrchestrationTerminal from '@/components/OrchestrationTerminal';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 p-6 md:p-12 selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-rose-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded italic">HEALTH</span>
              <span>OS</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide flex items-center gap-2">
              Central Intelligence Orchestrator <span className="h-1 w-1 bg-slate-600 rounded-full" /> 
              v1.0.0-alpha <span className="h-1 w-1 bg-slate-600 rounded-full" /> 
              High Reliability Mode
            </p>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">System Status</p>
                <p className="text-emerald-400 text-xs font-mono">ALL_NODES_OPERATIONAL</p>
             </div>
             <div className="h-10 w-10 glass rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse-slow" />
             </div>
          </div>
        </header>

        {/* High-Utility Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Intelligence Terminal */}
          <div className="lg:col-span-8 space-y-6">
            <OrchestrationTerminal />
            
            {/* Surveillance Status Bar */}
            <div className="glass p-5 rounded-xl border-emerald-500/10 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <div className="h-4 w-4 border-2 border-emerald-500/50 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-tight text-emerald-100">Public Health Surveillance</h3>
                    <p className="text-[10px] text-slate-500">Scanning Geofence-31: No abnormal clusters detected.</p>
                  </div>
               </div>
               <button className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors uppercase border border-emerald-500/20 px-3 py-1 rounded bg-emerald-500/5">
                 View Analytics
               </button>
            </div>
          </div>

          {/* Right Column: Live Telemetry */}
          <div className="lg:col-span-4 space-y-6">
            <HospitalHUD />
            <SOSFeed />
          </div>
        </div>

        {/* Footer Info */}
        <footer className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-slate-600 text-[10px] uppercase font-bold tracking-widest">
           <div className="flex gap-6">
              <span>© 2026 DeepMind advanced systems</span>
              <span>FHIR 4.0.1 Compliant</span>
           </div>
           <div className="flex gap-6">
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 bg-emerald-500 rounded-full" /> Logic: Active
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 bg-emerald-500 rounded-full" /> Security: Auth Gate Enforced
              </span>
           </div>
        </footer>
      </div>
    </main>
  );
}
