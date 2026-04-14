'use client';

interface SOSAlert {
  id: string;
  location: string;
  time: string;
  status: string;
  severity: 'CRITICAL' | 'HIGH' | 'INFO';
}

const MOCK_ALERTS: SOSAlert[] = [
  { id: '1', location: 'Times Square', time: '2m ago', status: 'Ambulance En Route', severity: 'CRITICAL' },
  { id: '2', location: 'East Village', time: '14m ago', status: 'Resolved', severity: 'INFO' },
  { id: '3', location: 'Battery Park', time: 'Just Now', status: 'Awaiting Triage', severity: 'HIGH' },
];

export default function SOSFeed() {
  return (
    <div className="glass p-6 rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-rose-500 uppercase tracking-widest">Active SOS Feed</h2>
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
      </div>

      <div className="space-y-4">
        {MOCK_ALERTS.map(alert => (
          <div key={alert.id} className="relative pl-4 border-l-2 border-rose-500/30">
            <div className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ${
              alert.severity === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 'bg-slate-500'
            }`} />
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-slate-200">{alert.location}</p>
              <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
            </div>
            <p className="text-[11px] text-rose-400 font-medium mb-1">{alert.status}</p>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
               <div className={`h-full bg-rose-500 ${alert.severity === 'CRITICAL' ? 'w-full' : 'w-2/3'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
