'use client';

import { motion } from 'framer-motion';

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-secondary/10 rounded-2xl border border-white/5 ${className}`}>
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%]"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear"
        }}
      />
      
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-white/5 rounded-md" />
            <div className="h-3 w-1/2 bg-white/5 rounded-md opacity-50" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/5 rounded-md" />
          <div className="h-3 w-[80%] bg-white/5 rounded-md opacity-70" />
          <div className="h-3 w-[60%] bg-white/5 rounded-md opacity-40" />
        </div>
        
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-24 bg-white/5 rounded-lg" />
          <div className="h-8 w-24 bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

