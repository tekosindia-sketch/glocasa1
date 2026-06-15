'use client';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';
import { formatXP, getXPProgress } from '@/lib/strngth/utils';
import { useStrngthStore } from '@/lib/strngth/store';

interface XPBarProps {
  showLabels?: boolean;
  height?: number;
}

export default function XPBar({ showLabels = true, height = 8 }: XPBarProps) {
  const { player } = useStrngthStore();
  const { current, max, percent } = getXPProgress(player.totalXP);

  const rawWidth = useMotionValue(0);
  const springWidth = useSpring(rawWidth, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const t = setTimeout(() => rawWidth.set(percent), 200);
    return () => clearTimeout(t);
  }, [percent, rawWidth]);

  const widthPct = useTransform(springWidth, v => `${v}%`);

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: '#00d4ff', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
              XP
            </span>
            <span className="text-xs" style={{ color: 'var(--gym-text-dim)' }}>
              {formatXP(current)} / {formatXP(max)}
            </span>
          </div>
          <span className="text-xs font-bold" style={{ color: '#00d4ff', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
            {percent.toFixed(1)}%
          </span>
        </div>
      )}
      <div className="gym-xp-bar relative" style={{ height }}>
        <motion.div className="gym-xp-fill" style={{ width: widthPct, height }} />
        {/* Shimmer */}
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          <div className="h-full gym-shine" />
        </div>
      </div>
    </div>
  );
}
