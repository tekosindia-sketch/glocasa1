'use client';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Mascot from './Mascot';
import SpeechBubble from './SpeechBubble';

const CYAN = '#00d4ff';

/**
 * Shared shell for an onboarding question step: top progress bar + back chevron,
 * a small mascot with a speech bubble, a scrollable content slot, and a fixed
 * bottom primary button (with optional Skip). Bottom stays pinned; content scrolls.
 */
export default function StepFrame({
  progress,
  onBack,
  bubble,
  title,
  children,
  primaryLabel = 'NEXT',
  onPrimary,
  primaryDisabled = false,
  onSkip,
  skipLabel = 'Skip',
}: {
  progress?: number; // 0..1
  onBack?: () => void;
  bubble: React.ReactNode;
  title?: string;
  children?: React.ReactNode;
  primaryLabel?: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  return (
    <div className="h-dvh flex flex-col px-5 pt-5 pb-5 max-w-2xl mx-auto w-full">
      {/* Top row: back + progress */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-8 h-8 flex items-center justify-center -ml-1 rounded-lg"
            style={{ color: 'var(--gym-text-dim)' }}
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <span className="w-8" />
        )}
        {progress != null && (
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--gym-surface-subtle)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: CYAN, boxShadow: `0 0 10px ${CYAN}` }}
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>

      {/* Mascot + bubble */}
      <div className="flex items-start gap-2 mt-5 flex-shrink-0">
        <div className="flex-shrink-0 -mt-2">
          <Mascot size={92} />
        </div>
        <div className="flex-1 pt-3 min-w-0">
          <SpeechBubble tail="left">{bubble}</SpeechBubble>
        </div>
      </div>

      {title && (
        <h1
          className="text-3xl font-black mt-7 flex-shrink-0"
          style={{ color: 'var(--gym-text)' }}
        >
          {title}
        </h1>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto mt-5 -mx-1 px-1">{children}</div>

      {/* Fixed bottom actions */}
      <div className="flex-shrink-0 pt-4 space-y-3">
        <motion.button
          onClick={onPrimary}
          disabled={primaryDisabled}
          whileTap={primaryDisabled ? undefined : { scale: 0.98 }}
          className="w-full py-4 rounded-2xl font-black text-base tracking-wide"
          style={
            primaryDisabled
              ? { background: 'var(--gym-surface-subtle)', color: 'var(--gym-text-tertiary)', border: '1px solid var(--gym-border)' }
              : {
                  background: CYAN,
                  color: '#04141d',
                  boxShadow: `0 0 24px ${CYAN}40`,
                  fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                }
          }
        >
          {primaryLabel}
        </motion.button>

        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full py-2 text-sm font-semibold"
            style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.1em' }}
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}
