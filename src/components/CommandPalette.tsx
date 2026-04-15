'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Ambulance, 
  Database, 
  Moon, 
  Sun, 
  FileText, 
  Plus, 
  Terminal, 
  Settings,
  ShieldCheck,
  Building2,
  Bell
} from 'lucide-react';
import { useHealthStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { language, theme, setTheme, clearLogs, addToast, userRole } = useHealthStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleAction = (action: () => void, message: string) => {
    action();
    addToast({ message, type: 'success', duration: 2000 });
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[3000]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          
          <div className="flex items-start justify-center pt-[15vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden"
            >
              <Command label={translations[language].command_palette_label} className="h-full flex flex-col">
                <div className="flex items-center border-b border-border px-6 py-5 gap-4">
                  <Search className="w-5 h-5 text-primary" />
                  <Command.Input 
                    autoFocus
                    placeholder={translations[language].command_palette_placeholder} 
                    className="w-full bg-transparent border-none outline-none text-base placeholder:text-muted-foreground/50 font-medium"
                  />
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary border border-border">
                    <span className="text-[10px] font-black text-muted-foreground">ESC</span>
                  </div>
                </div>

                <Command.List className="max-h-[400px] overflow-y-auto p-4 space-y-2 scrollbar-hide">
                  <Command.Empty className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-secondary/50 rounded-2xl mb-4 text-muted-foreground">
                      <Terminal className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{translations[language].no_results}</p>
                  </Command.Empty>

                  <Command.Group heading={translations[language].critical_orchestration} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-4 py-3">
                    <PaletteItem 
                      onSelect={() => handleAction(() => {}, translations[language].dispatch_mock)}
                      icon={Ambulance}
                      label={translations[language].dispatch_responder}
                      shortcut="D"
                    />
                    <PaletteItem 
                      onSelect={() => handleAction(() => {}, translations[language].sos_focus_mock)}
                      icon={Bell}
                      label={translations[language].focus_sos}
                      shortcut="F"
                    />
                  </Command.Group>

                  <Command.Group heading={translations[language].data_forensic} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-4 py-3">
                    <PaletteItem 
                      onSelect={() => handleAction(() => {}, translations[language].bundle_exported)}
                      icon={FileText}
                      label={translations[language].export_ips}
                      shortcut="E"
                    />
                    <PaletteItem 
                      onSelect={() => handleAction(clearLogs, translations[language].logs_purged)}
                      icon={Database}
                      label={translations[language].clear_history}
                      shortcut="X"
                    />
                  </Command.Group>

                  <Command.Group heading={translations[language].system_controls} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-4 py-3">
                    <PaletteItem 
                      onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      icon={theme === 'dark' ? Sun : Moon}
                      label={theme === 'dark' ? translations[language].switch_light : translations[language].switch_dark}
                      shortcut="T"
                    />
                    <PaletteItem 
                      onSelect={() => handleAction(() => {}, translations[language].settings_mock)}
                      icon={Settings}
                      label={translations[language].advanced_settings}
                      shortcut="S"
                    />
                  </Command.Group>
                </Command.List>

                {/* Footer */}
                <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {translations[language].authorized_label} {userRole?.toUpperCase() || translations[language].anonymous_label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 font-medium italic">
                    {translations[language].forensic_command_footer}
                  </p>
                </div>
              </Command>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PaletteItem({ onSelect, icon: Icon, label, shortcut }: { onSelect: () => void, icon: any, label: string, shortcut: string }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer hover:bg-primary/5 aria-selected:bg-primary/10 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-secondary group-aria-selected:bg-primary/10 group-aria-selected:text-primary transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 opacity-40 group-aria-selected:opacity-100 transition-opacity">
        <span className="text-[10px] font-black px-1.5 py-0.5 rounded border border-border group-aria-selected:border-primary/30">
          {shortcut}
        </span>
      </div>
    </Command.Item>
  );
}
