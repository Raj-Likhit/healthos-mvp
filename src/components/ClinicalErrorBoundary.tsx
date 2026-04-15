'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ClinicalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Clinical Error Detected:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] w-full flex items-center justify-center p-6 border-2 border-dashed border-destructive/30 rounded-3xl bg-destructive/5 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md text-center space-y-4"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center border border-destructive/50">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-black uppercase tracking-tighter text-destructive">
                Critical Module Failure
              </h2>
              <p className="text-xs font-bold text-muted-foreground/80 leading-relaxed">
                The <span className="text-foreground">{this.props.moduleName || 'Sentinel'}</span> node encountered an unhandled exception. Clinical safety protocols suggest a core reset.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-left text-rose-400 overflow-auto max-h-[100px] custom-scrollbar">
                <div className="flex items-center gap-2 mb-1 opacity-50">
                  <Terminal className="w-3 h-3" />
                  <span>ERROR_TRACE</span>
                </div>
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 bg-destructive text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-destructive/80 transition-all active:scale-95"
            >
              <RefreshCw className="w-3 h-3" />
              Initialize Reset
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
