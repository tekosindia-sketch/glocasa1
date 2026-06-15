'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  glow?: string;
  hover?: boolean;
  className?: string;
}

export default function GlassCard({ children, glow, hover = true, className = '', ...props }: GlassCardProps) {
  return (
    <motion.div
      className={`gym-glass rounded-2xl ${className}`}
      whileHover={hover ? { scale: 1.005, y: -1 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        boxShadow: glow ? `0 0 24px ${glow}20, 0 1px 0 rgba(255,255,255,0.05) inset` : '0 1px 0 rgba(255,255,255,0.05) inset',
        border: glow ? `1px solid ${glow}30` : undefined,
        ...props.style,
      }}
      {...props}>
      {children}
    </motion.div>
  );
}
