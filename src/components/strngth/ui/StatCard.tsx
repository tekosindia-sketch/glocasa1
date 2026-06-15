'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  glow: string;
  format?: (n: number) => string;
  subtext?: string;
  delay?: number;
}

export default function StatCard({ icon: Icon, label, value, suffix, color, glow, format, subtext, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="gym-glass rounded-2xl p-4 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      style={{ border: `1px solid ${color}22` }}>

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${glow.replace('0.4', '0.12')}, transparent 70%)` }} />

      <div className="flex items-start justify-between relative">
        <div className="flex-1">
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--gym-text-secondary)' }}>{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black" style={{ color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
              <AnimatedNumber value={value} format={format} />
            </span>
            {suffix && <span className="text-sm font-medium" style={{ color: 'var(--gym-text-dim)' }}>{suffix}</span>}
          </div>
          {subtext && <p className="text-[10px] mt-0.5" style={{ color: 'var(--gym-text-tertiary)' }}>{subtext}</p>}
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}
