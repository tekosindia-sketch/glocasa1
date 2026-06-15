'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useStrngthStore } from '@/lib/strngth/store';
import { getRankConfig } from '@/lib/strngth/utils';
import { Zap } from 'lucide-react';
import { useEffect } from 'react';

export default function LevelUpOverlay() {
  const { showLevelUpOverlay, levelUpData, dismissLevelUp, player } = useStrngthStore();
  const rankCfg = levelUpData?.newRank ? getRankConfig(levelUpData.newRank) : getRankConfig(player.rank);

  useEffect(() => {
    if (showLevelUpOverlay) {
      const t = setTimeout(dismissLevelUp, 5000);
      return () => clearTimeout(t);
    }
  }, [showLevelUpOverlay, dismissLevelUp]);

  return (
    <AnimatePresence>
      {showLevelUpOverlay && levelUpData && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissLevelUp}
          style={{ background: 'rgba(3,3,10,0.92)', backdropFilter: 'blur(8px)' }}>

          {/* Rays */}
          <div className="gym-levelup-rays absolute" />

          {/* Particles */}
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div key={i} className="absolute w-2 h-2 rounded-full pointer-events-none"
              style={{ background: rankCfg.color, left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], y: -80 - Math.random() * 80, x: (Math.random() - 0.5) * 120 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 1.2 }} />
          ))}

          {/* Main card */}
          <motion.div
            className="relative text-center px-10 py-12 rounded-3xl"
            initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            style={{
              background: 'rgba(13,13,26,0.98)',
              border: `2px solid ${rankCfg.color}`,
              boxShadow: `0 0 60px ${rankCfg.color}40, 0 0 120px ${rankCfg.color}20`,
              maxWidth: 380,
            }}>

            {/* Glow ring behind */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ boxShadow: `inset 0 0 60px ${rankCfg.color}08` }} />

            {/* Icon */}
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: `${rankCfg.color}15`, border: `2px solid ${rankCfg.color}` }}
              animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}>
              <Zap size={36} style={{ color: rankCfg.color }} />
            </motion.div>

            <motion.p
              className="text-sm font-semibold tracking-widest uppercase mb-2"
              style={{ color: rankCfg.color }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}>
              {levelUpData.newRank ? '⚡ Rank Up! ⚡' : 'Level Up!'}
            </motion.p>

            <motion.h2
              className="font-black text-5xl mb-3"
              style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', textShadow: `0 0 30px ${rankCfg.color}` }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}>
              {levelUpData.newRank ? levelUpData.newRank : `Lv.${levelUpData.newLevel}`}
            </motion.h2>

            {levelUpData.newRank && (
              <motion.p className="text-lg font-bold mb-1" style={{ color: rankCfg.color }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                {rankCfg.title}
              </motion.p>
            )}

            <motion.p className="text-sm" style={{ color: 'var(--gym-text-dim)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              You are getting stronger, Hunter.
            </motion.p>

            <motion.p className="text-xs mt-6" style={{ color: 'var(--gym-text-tertiary)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
