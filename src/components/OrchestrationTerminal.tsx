'use client';

import { useState } from 'react';
import { processHealthRequest } from '@/lib/orchestrator';

export default function OrchestrationTerminal() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<Array<{ type: string; content: string; data?: any }>>([
    { type: 'system', content: 'HealthOS v1.0.0-alpha: System Ready. State your emergency or request records.' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg = input;
    setInput('');
    setIsProcessing(true);
    setLogs(prev => [...prev, { type: 'user', content: userMsg }]);

    // simulate orchestration delay
    await new Promise(r => setTimeout(r, 600));

    try {
      const response = await processHealthRequest('SESSION_HACKATHON_DEMO', userMsg);
      
      setLogs(prev => [...prev, 
        { type: 'logic', content: `[${response.logic_module}] Logic Module triggered.` },
        { type: 'json', content: JSON.stringify(response.data, null, 2), data: response.data },
        { type: 'os', content: response.user_output }
      ]);
    } catch (err) {
      setLogs(prev => [...prev, { type: 'error', content: 'Orchestration Error: Protocol failure.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass p-6 rounded-xl space-y-4 h-[500px] flex flex-col border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.15)]">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-widest">Orchestrator Terminal</h2>
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-slate-800" />
          <div className="h-2 w-2 rounded-full bg-slate-800" />
          <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-3 bg-black/40 p-4 rounded-lg border border-white/5 scrollbar-hide">
        {logs.map((log, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-left-1 duration-300">
            {log.type === 'system' && <span className="text-emerald-500">SYSTEM: </span>}
            {log.type === 'user' && <span className="text-slate-500">USER_IN: </span>}
            {log.type === 'logic' && <span className="text-emerald-400">LOGIC_GATE: </span>}
            {log.type === 'json' && <span className="text-emerald-300/50">PROTOCOL_DATA: </span>}
            {log.type === 'os' && <span className="text-emerald-400 font-bold underline">HEALTH_OS: </span>}
            {log.type === 'error' && <span className="text-rose-500">FATAL: </span>}
            
            {log.type === 'json' ? (
              <pre className="mt-1 p-2 bg-emerald-950/20 rounded border border-emerald-500/10 text-[9px] text-emerald-300/70 overflow-x-auto">
                {log.content}
              </pre>
            ) : (
              <span className={log.type === 'os' ? 'text-emerald-50' : 'text-slate-300'}>{log.content}</span>
            )}
          </div>
        ))}
        {isProcessing && <div className="text-emerald-500 animate-pulse">Processing logic gates...</div>}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 pt-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message for Orchestrator..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-emerald-500/50 text-slate-200"
        />
        <button 
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-bold px-4 py-2 rounded-lg transition-colors uppercase"
        >
          Execute
        </button>
      </form>
    </div>
  );
}
