'use client';

import { MOCK_HOSPITALS } from '@/lib/database';

export default function HospitalHUD() {
  return (
    <div className="glass p-6 rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-widest">Inventory Monitor</h2>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">LIVE</span>
      </div>
      
      <div className="space-y-3">
        {MOCK_HOSPITALS.map((hospital) => (
          <div key={hospital.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm font-medium">{hospital.name}</p>
              <p className="text-[11px] text-slate-400">{hospital.location.text}</p>
              <div className="flex gap-2">
                {hospital.inventory.blood_groups.map(bg => (
                  <span key={bg} className="text-[9px] text-emerald-400/70">{bg}</span>
                ))}
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] text-slate-500">Beds</span>
                <span className={`text-xs font-mono ${hospital.inventory.beds > 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {hospital.inventory.beds.toString().padStart(2, '0')}
                </span>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                hospital.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {hospital.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
