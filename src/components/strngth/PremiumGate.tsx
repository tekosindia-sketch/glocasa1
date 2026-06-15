'use client';
import { motion } from 'framer-motion';
import { Lock, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStrngthStore } from '@/lib/strngth/store';
import { deriveIsPremium } from '@/lib/strngth/subscription';

interface PremiumGateProps {
  children?: React.ReactNode;
  feature?: string;
  description?: string;
}

/**
 * Wraps content that requires an active premium subscription.
 * Free / expired users see a lock screen with an upgrade CTA.
 * The gate is transparent to premium users — children render normally.
 */
export default function PremiumGate({ children, feature = 'This Feature', description }: PremiumGateProps) {
  const subscription = useStrngthStore(s => s.subscription);
  const isPremium = deriveIsPremium(subscription);
  const router = useRouter();

  if (isPremium) return <>{children}</>;

  const isExpired =
    !isPremium &&
    subscription.planName !== 'free' &&
    subscription.subscriptionExpiry !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      {/* Lock icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 22 }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.08))',
          border: '1.5px solid rgba(245,158,11,0.3)',
          boxShadow: '0 0 40px rgba(245,158,11,0.12)',
        }}
      >
        <Lock size={32} style={{ color: '#f59e0b' }} />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-xl font-black mb-2"
        style={{
          color: 'var(--gym-text)',
          fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
        }}
      >
        {feature.toUpperCase()}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm font-black mb-1"
        style={{ color: '#f59e0b' }}
      >
        {isExpired ? 'SUBSCRIPTION EXPIRED' : 'PREMIUM ONLY'}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-xs leading-relaxed mb-8 max-w-[260px]"
        style={{ color: 'var(--gym-text-muted)' }}
      >
        {description ??
          (isExpired
            ? 'Your subscription has expired. Renew to regain access to all premium features.'
            : 'Upgrade to Strngth Premium to unlock quests, custom programs, and advanced analytics.')}
      </motion.p>

      {/* CTA button */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => router.push('/strngth/profile?tab=settings')}
        className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm tracking-wider"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.1))',
          border: '1.5px solid rgba(245,158,11,0.5)',
          color: '#f59e0b',
          boxShadow: '0 0 24px rgba(245,158,11,0.15)',
        }}
      >
        <Zap size={15} />
        {isExpired ? 'RENEW SUBSCRIPTION' : 'UPGRADE TO PREMIUM'}
      </motion.button>
    </motion.div>
  );
}
