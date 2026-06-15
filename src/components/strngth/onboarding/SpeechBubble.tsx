'use client';
import { motion } from 'framer-motion';

/** Glass chat bubble. `tail` positions the little pointer: down (centered) or left. */
export default function SpeechBubble({
  children,
  tail = 'left',
}: {
  children: React.ReactNode;
  tail?: 'left' | 'down';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="relative rounded-2xl px-4 py-3"
      style={{
        background: 'var(--gym-surface-card)',
        border: '1px solid var(--gym-border-bright)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
      }}
    >
      <p className="text-[15px] leading-snug" style={{ color: 'var(--gym-text)' }}>
        {children}
      </p>

      {tail === 'left' && (
        <span
          className="absolute top-5 -left-2 w-3 h-3 rotate-45"
          style={{
            background: 'var(--gym-surface-card)',
            borderLeft: '1px solid var(--gym-border-bright)',
            borderBottom: '1px solid var(--gym-border-bright)',
          }}
        />
      )}
      {tail === 'down' && (
        <span
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
          style={{
            background: 'var(--gym-surface-card)',
            borderRight: '1px solid var(--gym-border-bright)',
            borderBottom: '1px solid var(--gym-border-bright)',
          }}
        />
      )}
    </motion.div>
  );
}
