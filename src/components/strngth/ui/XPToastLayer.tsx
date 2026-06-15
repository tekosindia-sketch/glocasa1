'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useStrngthStore } from '@/lib/strngth/store';
import { useEffect } from 'react';

export default function XPToastLayer() {
  const { xpGains, removeXPGain } = useStrngthStore();

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence>
        {xpGains.map(gain => (
          <XPToast key={gain.id} id={gain.id} amount={gain.amount} source={gain.source} onDone={removeXPGain} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function XPToast({ id, amount, source, onDone }: { id: string; amount: number; source: string; onDone: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(id), 2800);
    return () => clearTimeout(t);
  }, [id, onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
      style={{
        background: 'rgba(0,212,255,0.12)',
        border: '1px solid rgba(0,212,255,0.3)',
        color: '#00d4ff',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 16px rgba(0,212,255,0.2)',
        fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
        fontSize: '0.7rem',
      }}>
      <span>⚡</span>
      <span>+{amount} XP</span>
      <span style={{ color: 'var(--gym-text-muted)', fontFamily: 'Outfit, sans-serif', fontWeight: 400, fontSize: '0.65rem' }}>{source}</span>
    </motion.div>
  );
}
