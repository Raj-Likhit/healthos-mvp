'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain, Route, FileText, Radar, ShieldCheck, Activity, ChevronRight, Play, Server, Zap, ArrowRight, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-50 overflow-hidden font-sans selection:bg-emerald-500/30">
      
      {/* Premium Background Rig */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-emerald-500/10 rounded-full blur-[150px] animate-orbit mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/4 w-[50vw] h-[50vw] bg-zinc-800/40 rounded-full blur-[150px] animate-orbit mix-blend-screen" style={{ animationDelay: '-15s' }} />
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Minimal Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/50 backdrop-blur-md border-b (border-white/[0.02])">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-white w-5 h-5" />
            <span className="font-semibold tracking-tight text-white text-lg">
              HealthOS
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#performance" className="hover:text-white transition-colors">Performance</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="text-[13px] font-medium text-zinc-300 hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/onboarding" className="group flex items-center gap-2 px-4 py-1.5 bg-white text-black rounded-md text-[13px] font-semibold hover:bg-zinc-200 transition-all">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-24 flex flex-col items-center">
        
        {/* Section 1: Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto w-full pt-10 pb-20">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300 text-[11px] font-medium uppercase tracking-widest mb-8 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Gemini 2.0 Integration Live
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-[80px] font-bold tracking-tighter leading-[0.95] text-white flex flex-col items-center"
          >
            <span>Orchestrate chaos.</span>
            <span className="text-zinc-500 mt-2">Deploy precision.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-lg text-zinc-400 max-w-2xl font-normal leading-relaxed"
          >
            HealthOS is the clinical intelligence layer. It transforms fragmented 
            emergency data into autonomous, highly-typed dispatch sequences in milliseconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link href="/onboarding" className="w-full sm:w-auto px-6 py-3 bg-white text-black rounded-lg font-medium text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Start Orchestrating <ArrowRight className="w-4 h-4 text-zinc-600" />
            </Link>
            <a href="#demo" className="w-full sm:w-auto px-6 py-3 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white rounded-lg font-medium text-sm transition-colors text-center flex items-center justify-center gap-2">
              <Play className="w-4 h-4 text-zinc-400" /> Watch the flow
            </a>
          </motion.div>

          {/* Hero UI Asset Box */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 w-full max-w-4xl relative perspective-[2000px]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent blur-3xl rounded-full" />
            
            <div className="relative glass-premium rounded-xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] shadow-emerald-500/10">
              
              {/* Fake Window Header */}
              <div className="h-10 bg-zinc-900/80 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <div className="mx-auto text-[10px] uppercase tracking-widest text-zinc-500 font-medium">HealthOS // Triage Orchestrator</div>
              </div>

              {/* Fake Window Body */}
              <div className="p-6 bg-zinc-950/80 font-mono text-[13px] text-zinc-400 text-left h-[300px] overflow-hidden relative">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="text-zinc-600">00:00:01</span>
                    <span className="text-emerald-400">CONNECT</span>
                    <span className="text-zinc-300">establishing secure socket... OK</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-600">00:00:01</span>
                    <span className="text-blue-400">INGEST</span>
                    <span className="text-zinc-300">receiving voice payload [86kb, te-IN]...</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-600">00:00:02</span>
                    <span className="text-purple-400">GEMINI</span>
                    <span className="text-zinc-300">analyzing acoustics & semantics...</span>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                    className="flex gap-4"
                  >
                    <span className="text-zinc-600">00:00:02</span>
                    <span className="text-yellow-400">SYNTH</span>
                    <div className="text-zinc-200">
                      <div>&#123;</div>
                      <div className="pl-4">"severity": <span className="text-red-400">"CRITICAL"</span>,</div>
                      <div className="pl-4">"condition": <span className="text-emerald-300">"Myocardial Infarction"</span>,</div>
                      <div className="pl-4">"confidence": <span className="text-blue-300">0.98</span></div>
                      <div>&#125;</div>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="flex gap-4 pt-4 border-t border-white/5"
                  >
                    <span className="text-zinc-600">00:00:03</span>
                    <span className="text-emerald-400 font-bold">DISPATCH</span>
                    <span className="text-white bg-emerald-500/20 px-2 py-0.5 rounded text-xs border border-emerald-500/30">MAPPING NEAREST UNIT...</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 2: Social Proof Bar */}
        <section className="w-full border-y border-white/[0.02] bg-zinc-900/20 py-10 my-16 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-8">Built on robust infrastructure</p>
            <div className="flex w-full flex-wrap justify-center md:justify-between items-center gap-12 md:gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex flex-col items-center gap-2">
                <Zap className="w-6 h-6 text-white" /> 
                <span className="text-[11px] font-medium tracking-wider text-zinc-400">Gemini 2.0</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-white" /> 
                <span className="text-[11px] font-medium tracking-wider text-zinc-400">HIPAA Compliant</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-6 h-6 text-white" /> 
                <span className="text-[11px] font-medium tracking-wider text-zinc-400">FHIR 4.0.1</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Server className="w-6 h-6 text-white" /> 
                <span className="text-[11px] font-medium tracking-wider text-zinc-400">AES-256 Auth</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Globe className="w-6 h-6 text-white" /> 
                <span className="text-[11px] font-medium tracking-wider text-zinc-400">Edge Network</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Features */}
        <section id="features" className="w-full max-w-6xl mx-auto px-6 py-24">
          <div className="mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Engineered for <br className="hidden md:block"/>
                <span className="text-zinc-500">critical paths.</span>
              </h2>
            </div>
            <p className="text-zinc-400 text-sm max-w-sm">
              We abstracted away the complex interoperability protocols so responders can focus strictly on saving lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Brain, title: "Autonomous Triage", desc: "Voice-driven NLP processing translates frantic emergency calls into structured JSON priority queues almost instantly." },
              { icon: Route, title: "Inventory-Aware Dispatch", desc: "Algorithms match patient requirements against real-time hospital bed constraints and blood inventory data." },
              { icon: FileText, title: "FHIR Synthesis", desc: "Automatically packages unstructured medical reports into secure HL7 FHIR bundles for downstream EHRs." },
              { icon: Radar, title: "Spatial Surveillance", desc: "Geographic clustering algorithms automatically detect outbreak anomalies before they spread across zones." }
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative glass-card rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-colors"
              >
                {/* Spotlight effect placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-300 mb-6 group-hover:bg-white group-hover:text-black transition-all shadow-sm">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Workflow */}
        <section id="workflow" className="w-full max-w-6xl mx-auto px-6 py-24">
           <div className="glass-premium border border-white/5 rounded-3xl p-8 md:p-16 relative overflow-hidden">
             
             {/* Gradient glow behind workflow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
             
             <div className="relative z-10 text-center mb-16">
               <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-4">Pipeline Architecture</h2>
               <p className="text-zinc-400 text-sm max-w-lg mx-auto">From citizen report to medical intervention in less than a second.</p>
             </div>

             <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { step: "01", title: "Ingestion", desc: "Citizens input voice data or text locally via the mobile interface." },
                 { step: "02", title: "Orchestration", desc: "AI ranks cases, generates FHIR tokens, and validates inventory." },
                 { step: "03", title: "Execution", desc: "Responders are assigned and provided optimal routing paths." }
               ].map((item, i) => (
                 <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left relative">
                    {i !== 2 && (
                      <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] w-full h-[1px] bg-gradient-to-r from-zinc-700 to-transparent" />
                    )}
                    <div className="text-[10px] font-mono text-zinc-500 mb-4">{item.step}</div>
                    <h4 className="text-white font-semibold text-base mb-2">{item.title}</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* Section 5: Stats & Performance */}
        <section id="performance" className="w-full border-t border-white/[0.02] py-24 mt-12 bg-zinc-950">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
            
            <div className="w-full md:w-1/3">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Performance at Scale.</h2>
              <p className="text-zinc-400 text-sm">HealthOS was built from the ground up for strict clinical environments, prioritizing 100% uptime and offline fallback capabilities.</p>
            </div>

            <div className="w-full md:w-2/3 grid grid-cols-2 gap-x-8 gap-y-12">
               {[
                 { v: "< 1.2s", l: "Time to Route" },
                 { v: "O(1)", l: "Latency Scale" },
                 { v: "20/20", l: "Regressions" },
                 { v: "Zero", l: "Cold Starts" }
               ].map((stat, i) => (
                 <div key={i} className="flex flex-col items-start border-l border-white/10 pl-6">
                   <span className="text-3xl font-bold text-white tracking-tight mb-2">{stat.v}</span>
                   <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">{stat.l}</span>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Section 6: Footer CTA */}
        <section className="w-full max-w-4xl mx-auto px-6 py-32 text-center relative mt-12">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent blur-3xl z-0 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white text-center">
              Deploy your command center.
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-10">
              Transform emergency management today. Try the portal environment immediately without authenticating.
            </p>
            <Link href="/onboarding" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-lg font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Start Building Now
              <ArrowRight className="w-4 h-4 text-zinc-600" />
            </Link>
          </div>
        </section>

      </main>

      {/* Modern Minimal Footer */}
      <footer className="w-full border-t border-white/5 bg-zinc-950 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
             <Activity className="w-4 h-4 text-zinc-600" />
             <span className="text-sm font-medium text-zinc-500">HealthOS © 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-600">
             <a href="#" className="hover:text-zinc-300 transition-colors">Documentation</a>
             <a href="#" className="hover:text-zinc-300 transition-colors">API Reference</a>
             <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
             <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
