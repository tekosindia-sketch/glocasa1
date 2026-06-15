'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Rank } from '@/lib/strngth/types';
import { getRankConfig } from '@/lib/strngth/utils';

interface AuraRingProps {
  rank: Rank;
  color?: string;
  size?: number;
  children: ReactNode;
  intensity?: 'low' | 'medium' | 'high';
}

export default function AuraRing({ rank, color, size, children, intensity = 'medium' }: AuraRingProps) {
  const cfg = getRankConfig(rank);
  const auraColor = color ?? cfg.color;

  const dim  = { low: '45', medium: '65', high: '85' }[intensity];
  const peak = { low: 'aa', medium: 'cc', high: 'ff' }[intensity];
  const br   = size ? `${Math.round(size / 6)}px` : '18px';

  return (
    <motion.div
      style={{
        position: 'relative',
        display: 'inline-block',
        borderRadius: br,
      }}
      animate={{
        boxShadow: [
          `0 0 0 2px ${auraColor}${dim}, 0 0 18px ${auraColor}28, 0 0 4px ${auraColor}30`,
          `0 0 0 2px ${auraColor}${peak}, 0 0 36px ${auraColor}55, 0 0 8px ${auraColor}50`,
          `0 0 0 2px ${auraColor}${dim}, 0 0 18px ${auraColor}28, 0 0 4px ${auraColor}30`,
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
