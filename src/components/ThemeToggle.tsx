'use client';

import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useHealthStore } from '@/lib/store';
import { useEffect, useState, useRef } from 'react';

/**
 * CelestialToggle — A fully custom day/night toggle.
 *
 * Light → Dark: Sun "sets" (slides down, rays retract), sky fills with stars,
 *               crescent moon rises from the bottom.
 * Dark → Light: Moon "sets" (slides down), background clears, sun rises with
 *               expanding rays.
 *
 * Entirely CSS-variable-driven — no hardcoded palette.
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useHealthStore();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  /* ── Ripple effect state ── */
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);
  const btnRef = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (!mounted) return (
    <div className="relative h-10 w-[88px] rounded-full border" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }} />
  );

  const isDark = theme === 'dark';

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isAnimating) return;
    setIsAnimating(true);

    /* Spawn ripple at click position */
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = rippleId.current++;
      setRipples(r => [...r, { id, x, y }]);
      setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
    }

    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setTimeout(() => setIsAnimating(false), 600);
  };


  /* ── Sun ray animation variants ── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rayContainerVariants: any = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
    exit:   { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rayVariants: any = {
    hidden:  { scaleY: 0, opacity: 0 },
    visible: { scaleY: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 18 } },
    exit:    { scaleY: 0, opacity: 0 },
  };

  const RAY_COUNT = 8;
  const rays = Array.from({ length: RAY_COUNT });

  return (
    <motion.button
      ref={btnRef}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className="relative h-10 w-[88px] rounded-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 select-none cursor-pointer"
      whileTap={{ scale: 0.96 }}
    >
      {/* ── Track background ── */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: isDark
            ? 'linear-gradient(135deg, #0d0d1a 0%, #1a1a3e 100%)'
            : 'linear-gradient(135deg, #87ceeb 0%, #fde68a 100%)',
        }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* ── Stars (only in dark) ── */}
      <AnimatePresence>
        {isDark && (
          <motion.div
            key="stars"
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {[
              { cx: 10, cy: 7,  r: 1.0 },
              { cx: 20, cy: 16, r: 0.7 },
              { cx: 8,  cy: 22, r: 0.8 },
              { cx: 16, cy: 4,  r: 0.6 },
              { cx: 26, cy: 10, r: 0.7 },
              { cx: 6,  cy: 13, r: 0.5 },
            ].map((s, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: s.r * 2,
                  height: s.r * 2,
                  left: s.cx,
                  top: s.cy,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.6, 1], scale: 1 }}
                transition={{
                  delay: i * 0.07 + 0.15,
                  duration: 0.4,
                  opacity: { repeat: Infinity, duration: 2 + i * 0.3, ease: 'easeInOut' },
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Clouds (only in light) ── */}
      <AnimatePresence>
        {!isDark && (
          <motion.div
            key="clouds"
            className="absolute left-1.5 top-2"
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 0.6 }}
            exit={{ x: -16, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <svg width="20" height="9" viewBox="0 0 20 9" fill="white">
              <ellipse cx="7"  cy="6" rx="6"  ry="3" />
              <ellipse cx="13" cy="7" rx="6.5" ry="2.5" />
              <ellipse cx="10" cy="4" rx="5"  ry="3" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Thumb (Sun / Moon) ── */}
      <motion.div
        className="absolute top-1 flex items-center justify-center rounded-full shadow-lg"
        style={{ width: 32, height: 32 }}
        animate={{ x: isDark ? 52 : 4 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            /* ── Moon ── */
            <motion.div
              key="moon"
              className="relative flex items-center justify-center w-full h-full rounded-full"
              style={{ background: 'radial-gradient(circle at 35% 35%, #e0e7ff, #818cf8)' }}
              initial={{ rotate: 60, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -60, scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              {/* Crescent overlay */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 20,
                  height: 20,
                  background: 'radial-gradient(circle at 60% 40%, #1a1a3e, transparent 70%)',
                  top: 3,
                  left: 7,
                }}
              />
              {/* Moon glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ boxShadow: ['0 0 10px 2px rgba(129,140,248,0.5)', '0 0 18px 5px rgba(129,140,248,0.3)', '0 0 10px 2px rgba(129,140,248,0.5)'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              />
            </motion.div>
          ) : (
            /* ── Sun + Rays ── */
            <motion.div
              key="sun"
              className="relative flex items-center justify-center w-full h-full rounded-full"
              style={{ background: 'radial-gradient(circle, #fde68a 40%, #f59e0b 100%)' }}
              initial={{ rotate: -60, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 60, scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              {/* Sun glow pulse */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ boxShadow: ['0 0 12px 3px rgba(245,158,11,0.6)', '0 0 22px 8px rgba(245,158,11,0.3)', '0 0 12px 3px rgba(245,158,11,0.6)'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              />
              {/* Rays */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              >
                <motion.div
                  className="absolute inset-0"
                  variants={rayContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {rays.map((_, i) => {
                    const angle = (i / RAY_COUNT) * 360;
                    return (
                      <motion.div
                        key={i}
                        variants={rayVariants}
                        className="absolute bg-amber-300 rounded-full origin-bottom"
                        style={{
                          width: 3,
                          height: 7,
                          left: '50%',
                          bottom: '50%',
                          marginLeft: -1.5,
                          transformOrigin: 'bottom center',
                          transform: `rotate(${angle}deg) translateY(-18px)`,
                        }}
                      />
                    );
                  })}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Click ripples ── */}
      {ripples.map(rp => (
        <motion.span
          key={rp.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: rp.x,
            top: rp.y,
            translateX: '-50%',
            translateY: '-50%',
            background: isDark ? 'rgba(129,140,248,0.35)' : 'rgba(245,158,11,0.35)',
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ width: 120, height: 120, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
      ))}

      {/* ── Border ring ── */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{ borderColor: isDark ? 'rgba(129,140,248,0.4)' : 'rgba(245,158,11,0.5)' }}
        transition={{ duration: 0.5 }}
        style={{ border: '1.5px solid' }}
      />
    </motion.button>
  );
}
