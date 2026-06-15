'use client';
import { motion } from 'framer-motion';

const CYAN = '#00d4ff';

/** Selectable option row with a cyan border + glow when selected. */
export default function OptionCard({
  selected,
  onClick,
  children,
  className = '',
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left rounded-2xl transition-colors ${className}`}
      style={{
        background: selected ? 'rgba(0,212,255,0.10)' : 'var(--gym-surface-subtle)',
        border: `1.5px solid ${selected ? CYAN : 'var(--gym-border)'}`,
        boxShadow: selected ? `0 0 18px ${CYAN}33` : 'none',
      }}
    >
      {children}
    </motion.button>
  );
}
