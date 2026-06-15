'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const CYAN = '#00d4ff';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="relative h-dvh flex flex-col px-6 pt-6 pb-8 max-w-2xl mx-auto w-full overflow-hidden">
      {/* Centered ambient glow */}
      <div
        className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none -z-0"
        style={{ background: `radial-gradient(circle, ${CYAN}14, transparent 65%)`, filter: 'blur(6px)' }}
      />

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Rank emblem */}
        <motion.div
          className="relative mb-7"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
            style={{ border: `1.5px solid ${CYAN}`, boxShadow: `0 0 22px ${CYAN}55` }}
          />
          <svg width="96" height="104" viewBox="0 0 80 88" fill="none">
            <path
              d="M40 6 L70 20 L70 50 C70 66 40 80 40 80 C40 80 10 66 10 50 L10 20 Z"
              fill={`${CYAN}12`}
              stroke={CYAN}
              strokeWidth="2.5"
            />
            {/* Lightning bolt */}
            <path
              d="M45 24 L29 47 L39 47 L35 64 L53 39 L42 39 Z"
              fill={CYAN}
              style={{ filter: `drop-shadow(0 0 6px ${CYAN})` }}
            />
          </svg>
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl font-black tracking-tight text-center"
          style={{
            color: CYAN,
            fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
            textShadow: `0 0 40px ${CYAN}55`,
          }}
        >
          STRNGTH
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-3 text-lg"
          style={{ color: 'var(--gym-text-muted)' }}
        >
          Lift, Rank, Repeat!
        </motion.p>
      </div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="relative z-10 w-full space-y-3"
      >
        <motion.button
          onClick={() => router.push('/strngth/onboarding')}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl font-black text-base tracking-wide"
          style={{
            background: CYAN,
            color: '#04141d',
            boxShadow: `0 0 24px ${CYAN}40`,
            fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
          }}
        >
          GET STARTED
        </motion.button>
        <motion.button
          onClick={() => router.push('/strngth/signin')}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl font-bold text-base tracking-wide"
          style={{
            background: 'var(--gym-surface-subtle)',
            color: CYAN,
            border: `1px solid ${CYAN}33`,
          }}
        >
          I HAVE AN ACCOUNT
        </motion.button>
      </motion.div>
    </div>
  );
}
