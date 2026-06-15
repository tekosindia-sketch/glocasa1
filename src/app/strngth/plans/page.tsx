'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Shield } from 'lucide-react';
import { useStrngthStore } from '@/lib/strngth/store';

type PlanId = '1month' | '6month' | 'lifetime';

interface PlanConfig {
  id: PlanId;
  label: string;
  icon: string;
  color: string;
  price: string;
  per: string;
  perLine2?: string;
  note: string;
  badge: string | null;
  saveBadge: string | null;
  features: string[];
}

const PLANS: PlanConfig[] = [
  {
    id: '1month',
    label: '1 MONTH',
    icon: '⚡',
    color: '#00d4ff',
    price: '₹299',
    per: '/mo',
    note: 'Billed monthly',
    badge: null,
    saveBadge: null,
    features: [
      'Full workout tracker',
      'Quest & XP system',
      'Rank progression (E → SSS)',
      'Badge collection',
      'Cloud sync',
    ],
  },
  {
    id: '6month',
    label: '6 MONTHS',
    icon: '👑',
    color: '#7c3aed',
    price: '₹1,499',
    per: '/6',
    perLine2: 'mo',
    note: '₹249/month · Save ₹295',
    badge: 'MOST POPULAR',
    saveBadge: 'SAVE 17%',
    features: [
      'Everything in 1 Month',
      'Advanced analytics',
      'Custom workout plans',
      'Full leaderboard access',
      'Priority support',
    ],
  },
  {
    id: 'lifetime',
    label: 'LIFETIME',
    icon: '∞',
    color: '#f59e0b',
    price: '₹3,999',
    per: '',
    note: 'Pay once · Own forever',
    badge: 'BEST VALUE',
    saveBadge: 'ONE-TIME',
    features: [
      'Everything · Forever',
      'Early feature access',
      'Exclusive SSS aura',
      'Unlimited history',
      'No future charges',
    ],
  },
];

function PlanCard({ plan, index, onSelect }: { plan: PlanConfig; index: number; onSelect: (id: PlanId) => void }) {
  const [selecting, setSelecting] = useState(false);

  function handleSelect() {
    if (selecting) return;
    setSelecting(true);
    setTimeout(() => onSelect(plan.id), 500);
  }

  const highlighted = plan.badge !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.45 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: highlighted
          ? `linear-gradient(145deg, rgba(${plan.id === '6month' ? '124,58,237' : '245,158,11'},0.08) 0%, rgba(10,10,20,0.95) 50%)`
          : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${highlighted ? plan.color + '55' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: highlighted ? `0 0 32px ${plan.color}18` : 'none',
      }}
    >
      <div className="p-5">
        {/* Top row: plan label + badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-black tracking-widest"
            style={{
              color: plan.color,
              fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
            }}
          >
            {plan.label}
          </span>
          {plan.badge && (
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{
                color: plan.color,
                background: `${plan.color}18`,
                border: `1px solid ${plan.color}44`,
                fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
              }}
            >
              {plan.badge}
            </span>
          )}
        </div>

        {/* Price row: icon + price + per + save badge */}
        <div className="flex items-start gap-3 mb-2">
          {/* Icon circle */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 font-black"
            style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}33`, color: plan.color }}
          >
            {plan.icon}
          </div>

          {/* Price + per */}
          <div className="flex items-start gap-1.5 flex-1">
            <span
              className="text-[40px] leading-none font-black"
              style={{ color: plan.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}
            >
              {plan.price}
            </span>
            {plan.per && (
              <div className="flex flex-col leading-tight mt-1" style={{ color: '#9ca3af' }}>
                <span className="text-sm font-semibold">{plan.per}</span>
                {plan.perLine2 && <span className="text-sm font-semibold">{plan.perLine2}</span>}
              </div>
            )}
          </div>

          {/* Save badge */}
          {plan.saveBadge && (
            <span
              className="text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 mt-1"
              style={plan.saveBadge === 'ONE-TIME'
                ? { color: '#10b981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }
                : { color: '#10b981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }
              }
            >
              {plan.saveBadge}
            </span>
          )}
        </div>

        {/* Note */}
        <p className="text-xs mb-4" style={{ color: '#6b7280' }}>{plan.note}</p>

        {/* Divider */}
        <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, ${plan.color}33, transparent)` }} />

        {/* Features */}
        <div className="space-y-2 mb-5">
          {plan.features.map(f => (
            <div key={f} className="flex items-center gap-2.5">
              <Check size={13} strokeWidth={2.5} style={{ color: plan.color, flexShrink: 0 }} />
              <span className="text-sm" style={{ color: '#d1d5db' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleSelect}
          disabled={selecting}
          whileHover={selecting ? undefined : { scale: 1.02 }}
          whileTap={selecting ? undefined : { scale: 0.97 }}
          className="w-full py-3.5 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-2"
          style={{
            background: selecting ? `${plan.color}22` : 'transparent',
            color: selecting ? plan.color : plan.color,
            border: `1.5px solid ${plan.color}${selecting ? '66' : '99'}`,
            fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
            boxShadow: selecting ? 'none' : `0 0 16px ${plan.color}18`,
          }}
        >
          {selecting ? (
            <>
              <Check size={13} strokeWidth={3} />
              ACTIVATING…
            </>
          ) : (
            <>
              SELECT PLAN
              <ChevronRight size={14} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function PlansPage() {
  const router = useRouter();
  const setMembershipPlan = useStrngthStore(s => s.setMembershipPlan);

  function handleSelect(id: PlanId) {
    setMembershipPlan(id);
    router.replace('/strngth');
  }

  function handleFree() {
    setMembershipPlan(null);
    router.replace('/strngth');
  }

  return (
    <div
      className="min-h-dvh"
      style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #0a0a10 100%)' }}
    >
      {/* Ambient glow top */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 h-64"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 65%)' }} />

      <div className="relative max-w-sm mx-auto px-4 pt-10 pb-12">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-widest"
            style={{
              color: '#7c3aed',
              border: '1px solid rgba(124,58,237,0.4)',
              background: 'rgba(124,58,237,0.08)',
              fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
            }}
          >
            <Shield size={11} strokeWidth={2.5} />
            STRNGTH PRO
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="text-center mb-3"
        >
          <h1
            className="text-[38px] font-black leading-none tracking-tight mb-1"
            style={{ fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', color: '#f3f4f6' }}
          >
            UNLOCK YOUR
          </h1>
          <h1
            className="text-[38px] font-black leading-none tracking-tight"
            style={{
              fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            POTENTIAL
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16 }}
          className="text-center text-sm leading-relaxed mb-8"
          style={{ color: '#6b7280' }}
        >
          Choose your path. All features unlocked<br />during early access.
        </motion.p>

        {/* Plan cards */}
        <div className="space-y-4 mb-8">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} onSelect={handleSelect} />
          ))}
        </div>

        {/* Continue for free */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center"
        >
          <button
            onClick={handleFree}
            className="inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: '#9ca3af' }}
          >
            Continue for free
            <ChevronRight size={14} />
          </button>
          <p className="text-[11px] mt-1" style={{ color: '#4b5563' }}>
            All features unlocked · No payment required during beta
          </p>
        </motion.div>

      </div>
    </div>
  );
}
