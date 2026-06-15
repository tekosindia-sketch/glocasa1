'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Zap, Lock, X, Trophy, Flame } from 'lucide-react';
import { useStrngthStore } from '@/lib/strngth/store';
import { getRankConfig } from '@/lib/strngth/utils';
import { Badge } from '@/lib/strngth/types';
import { deriveIsPremium } from '@/lib/strngth/subscription';
import PremiumGate from '@/components/strngth/PremiumGate';

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = 'daily' | 'weekly' | 'awards';

const RARITY_COLORS = {
  common:    '#94a3b8',
  rare:      '#3b82f6',
  epic:      '#8b5cf6',
  legendary: '#f59e0b',
} as const;

const RARITY_GLOWS = {
  common:    'rgba(148,163,184,0.35)',
  rare:      'rgba(59,130,246,0.4)',
  epic:      'rgba(139,92,246,0.45)',
  legendary: 'rgba(245,158,11,0.5)',
} as const;


type RarityFilter = 'all' | Badge['rarity'];

// ─── Quest Card ───────────────────────────────────────────────────────────────

function QuestCard({
  quest, index, rankColor, onClaim,
}: {
  quest: { id: string; title: string; description: string; icon: string; xpReward: number; progress: number; target: number; completed: boolean; expiresAt: string };
  index: number;
  rankColor: string;
  onClaim: () => void;
}) {
  const progressPct = Math.min(100, (quest.progress / quest.target) * 100);
  const canClaim = quest.progress >= quest.target && !quest.completed;
  const remaining = Math.max(0, new Date(quest.expiresAt).getTime() - Date.now());
  const hours = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const isUrgent = hours < 2 && !quest.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: quest.completed
          ? 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(16,185,129,0.02))'
          : canClaim
            ? `linear-gradient(135deg, ${rankColor}08, ${rankColor}03)`
            : 'var(--gym-surface-subtle)',
        border: `1px solid ${quest.completed ? 'rgba(16,185,129,0.28)' : canClaim ? `${rankColor}45` : 'rgba(255,255,255,0.07)'}`,
      }}>

      {/* Ambient top glow */}
      {quest.completed && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(16,185,129,0.1), transparent 55%)' }} />
      )}
      {canClaim && (
        <motion.div className="absolute inset-0 pointer-events-none rounded-3xl"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          style={{ background: `radial-gradient(ellipse at 30% 0%, ${rankColor}10, transparent 55%)` }} />
      )}

      {/* Left accent strip */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
        style={{ background: quest.completed ? '#10b981' : canClaim ? rankColor : 'rgba(255,255,255,0.1)' }} />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start gap-3.5">

          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[1.6rem] flex-shrink-0 relative"
            style={{
              background: quest.completed
                ? 'rgba(16,185,129,0.12)'
                : canClaim ? `${rankColor}12` : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${quest.completed ? 'rgba(16,185,129,0.35)' : canClaim ? `${rankColor}40` : 'rgba(255,255,255,0.09)'}`,
              boxShadow: canClaim ? `0 0 16px ${rankColor}30` : 'none',
            }}>
            {quest.icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-black leading-tight"
                style={{ color: quest.completed ? '#10b981' : 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                {quest.title}
              </h3>

              {/* XP pill */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0"
                style={{ background: `${rankColor}12`, border: `1px solid ${rankColor}30` }}>
                <Zap size={9} style={{ color: rankColor }} />
                <span className="text-[10px] font-black" style={{ color: rankColor, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                  +{quest.xpReward} XP
                </span>
              </div>
            </div>

            <p className="text-[11px] mb-3 leading-relaxed" style={{ color: 'var(--gym-text-secondary)' }}>{quest.description}</p>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[9px] mb-1.5" style={{ color: 'var(--gym-text-tertiary)' }}>
                <span style={{ letterSpacing: '0.1em' }}>PROGRESS</span>
                <span style={{ fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', color: quest.completed ? '#10b981' : 'var(--gym-text-dim)' }}>
                  {quest.progress}/{quest.target}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--gym-surface-subtle)' }}>
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ delay: 0.3 + index * 0.07, duration: 1, ease: 'easeOut' }}
                  style={{
                    background: quest.completed
                      ? 'linear-gradient(90deg, #059669, #10b981)'
                      : `linear-gradient(90deg, ${rankColor}90, ${rankColor})`,
                    boxShadow: quest.completed ? '0 0 10px rgba(16,185,129,0.55)' : canClaim ? `0 0 10px ${rankColor}60` : 'none',
                  }} />
              </div>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[9px]"
                style={{ color: quest.completed ? '#10b981' : isUrgent ? '#ef4444' : 'var(--gym-text-tertiary)', letterSpacing: '0.08em' }}>
                {quest.completed ? (
                  <><CheckCircle2 size={9} /> COMPLETED</>
                ) : (
                  <><Clock size={9} /> {hours}h {mins}m left</>
                )}
              </span>

              {canClaim && (
                <motion.button
                  className="px-4 py-1.5 rounded-xl text-[10px] font-black"
                  style={{
                    background: `${rankColor}18`,
                    border: `1.5px solid ${rankColor}55`,
                    color: rankColor,
                    fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                  }}
                  animate={{ boxShadow: [`0 0 8px ${rankColor}25`, `0 0 20px ${rankColor}50`, `0 0 8px ${rankColor}25`] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={e => { e.stopPropagation(); onClaim(); }}>
                  CLAIM REWARD
                </motion.button>
              )}
            </div>
          </div>

          {quest.completed && (
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }} className="flex-shrink-0 mt-0.5">
              <CheckCircle2 size={22} style={{ color: '#10b981' }} />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Badge Emblem (SVG rank-style icon) ──────────────────────────────────────

function BadgeEmblem({ badge, size = 58 }: { badge: Badge; size?: number }) {
  const rc = RARITY_COLORS[badge.rarity];
  const locked = !badge.unlocked;
  const sc = locked ? 'rgba(200,200,230,0.22)' : rc;
  const gid = `emb-${badge.id}-${size}`;

  const commonEl = (
    <>
      <circle cx="50" cy="50" r="40" fill={`url(#${gid})`} stroke={sc} strokeWidth="2.8" strokeOpacity={locked ? 0.3 : 0.9}/>
      <circle cx="50" cy="50" r="32" fill="none" stroke={sc} strokeWidth="0.9" strokeOpacity={locked ? 0.12 : 0.28}/>
      {!locked && <>
        <circle cx="50" cy="11" r="2.2" fill={sc} fillOpacity="0.55"/>
        <circle cx="50" cy="89" r="2.2" fill={sc} fillOpacity="0.55"/>
        <circle cx="11" cy="50" r="2.2" fill={sc} fillOpacity="0.55"/>
        <circle cx="89" cy="50" r="2.2" fill={sc} fillOpacity="0.55"/>
      </>}
    </>
  );

  const rareEl = (
    <>
      <polygon points="50,10 87,30 87,70 50,90 13,70 13,30"
        fill={`url(#${gid})`} stroke={sc} strokeWidth="2.8" strokeOpacity={locked ? 0.3 : 0.9}/>
      <polygon points="50,19 79,36 79,64 50,81 21,64 21,36"
        fill="none" stroke={sc} strokeWidth="0.9" strokeOpacity={locked ? 0.12 : 0.28}/>
      {!locked && ['50,10','87,30','87,70','50,90','13,70','13,30'].map((pt, i) => {
        const [x, y] = pt.split(',').map(Number);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={sc} fillOpacity="0.7"/>;
      })}
    </>
  );

  const epicEl = (
    <>
      <path d="M14,10 L86,10 L86,56 L50,91 L14,56 Z"
        fill={`url(#${gid})`} stroke={sc} strokeWidth="2.8" strokeOpacity={locked ? 0.3 : 0.9}/>
      <path d="M21,17 L79,17 L79,54 L50,83 L21,54 Z"
        fill="none" stroke={sc} strokeWidth="0.9" strokeOpacity={locked ? 0.12 : 0.28}/>
      {!locked && <>
        <circle cx="14" cy="10" r="3" fill={sc} fillOpacity="0.75"/>
        <circle cx="86" cy="10" r="3" fill={sc} fillOpacity="0.75"/>
        <circle cx="14" cy="56" r="2.5" fill={sc} fillOpacity="0.6"/>
        <circle cx="86" cy="56" r="2.5" fill={sc} fillOpacity="0.6"/>
        <circle cx="50" cy="91" r="3" fill={sc} fillOpacity="0.8"/>
        {/* top notch */}
        <rect x="43" y="6" width="14" height="6" rx="2" fill={sc} fillOpacity="0.3" stroke={sc} strokeWidth="0.8" strokeOpacity="0.5"/>
      </>}
    </>
  );

  const legendaryEl = (
    <>
      {/* Left wing outer */}
      <path d="M17,48 C4,33 -3,43 4,55 C0,65 8,72 17,66 L17,58 Z"
        fill={sc} fillOpacity={locked ? 0.07 : 0.22} stroke={sc} strokeWidth="1.4" strokeOpacity={locked ? 0.15 : 0.65}/>
      {/* Left wing feather line */}
      <path d="M17,38 C7,26 1,36 8,49"
        fill="none" stroke={sc} strokeWidth="1.1" strokeOpacity={locked ? 0.1 : 0.38}/>
      {/* Right wing outer */}
      <path d="M83,48 C96,33 103,43 96,55 C100,65 92,72 83,66 L83,58 Z"
        fill={sc} fillOpacity={locked ? 0.07 : 0.22} stroke={sc} strokeWidth="1.4" strokeOpacity={locked ? 0.15 : 0.65}/>
      {/* Right wing feather line */}
      <path d="M83,38 C93,26 99,36 92,49"
        fill="none" stroke={sc} strokeWidth="1.1" strokeOpacity={locked ? 0.1 : 0.38}/>
      {/* Central shield */}
      <path d="M20,12 L80,12 L80,57 L50,90 L20,57 Z"
        fill={`url(#${gid})`} stroke={sc} strokeWidth="2.8" strokeOpacity={locked ? 0.3 : 0.92}/>
      <path d="M27,19 L73,19 L73,55 L50,82 L27,55 Z"
        fill="none" stroke={sc} strokeWidth="0.9" strokeOpacity={locked ? 0.12 : 0.28}/>
      {/* Crown points */}
      {!locked && <>
        <polygon points="36,12 39,5 43,12" fill={sc} fillOpacity="0.6"/>
        <polygon points="46,10 50,3 54,10" fill={sc} fillOpacity="0.85"/>
        <polygon points="57,12 61,5 64,12" fill={sc} fillOpacity="0.6"/>
        <circle cx="20" cy="12" r="2.8" fill={sc} fillOpacity="0.8"/>
        <circle cx="80" cy="12" r="2.8" fill={sc} fillOpacity="0.8"/>
        <circle cx="20" cy="57" r="2.2" fill={sc} fillOpacity="0.6"/>
        <circle cx="80" cy="57" r="2.2" fill={sc} fillOpacity="0.6"/>
        <circle cx="50" cy="90" r="3" fill={sc} fillOpacity="0.9"/>
      </>}
    </>
  );

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      {/* SVG emblem */}
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={gid} cx="42%" cy="28%" r="65%">
            <stop offset="0%" stopColor={locked ? '#1c1c2e' : rc} stopOpacity={locked ? 0.55 : 0.45}/>
            <stop offset="100%" stopColor={locked ? '#0a0a14' : rc} stopOpacity={locked ? 0.1 : 0.05}/>
          </radialGradient>
        </defs>
        {badge.rarity === 'common'    && commonEl}
        {badge.rarity === 'rare'      && rareEl}
        {badge.rarity === 'epic'      && epicEl}
        {badge.rarity === 'legendary' && legendaryEl}
      </svg>

      {/* Emoji on top */}
      <div className="relative z-10 select-none flex items-center justify-center"
        style={{
          fontSize: size * 0.31,
          lineHeight: 1,
          filter: locked
            ? 'grayscale(1) brightness(0.3)'
            : `drop-shadow(0 0 ${size * 0.07}px ${rc}90)`,
          marginTop: (badge.rarity === 'epic' || badge.rarity === 'legendary') ? `-${size * 0.04}px` : 0,
        }}>
        {badge.icon}
      </div>

      {/* Lock badge */}
      {locked && (
        <div className="absolute bottom-0 right-0 z-20 flex items-center justify-center rounded-full"
          style={{ width: size * 0.3, height: size * 0.3, background: 'var(--gym-surface-card)', border: '1px solid var(--gym-border-bright)' }}>
          <Lock size={size * 0.15} style={{ color: 'var(--gym-text-tertiary)' }} />
        </div>
      )}
    </div>
  );
}

// ─── Badge Card ───────────────────────────────────────────────────────────────

function BadgeCard({ badge, index, onClick }: { badge: Badge; index: number; onClick: () => void }) {
  const rc = RARITY_COLORS[badge.rarity];
  const rg = RARITY_GLOWS[badge.rarity];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 350, damping: 22 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-2.5 rounded-3xl relative overflow-hidden"
      style={{
        background: badge.unlocked
          ? `radial-gradient(ellipse at 50% 0%, ${badge.color}10, ${badge.color}03)`
          : 'var(--gym-surface-subtle)',
        border: `1.5px solid ${badge.unlocked ? `${rc}40` : 'rgba(255,255,255,0.06)'}`,
        boxShadow: badge.unlocked ? `0 4px 22px ${rg}` : 'none',
      }}
      whileHover={{ scale: 1.07, y: -2 }}
      whileTap={{ scale: 0.92 }}>

      {/* Emblem */}
      <BadgeEmblem badge={badge} size={60} />

      {/* Name */}
      <span className="text-[8.5px] font-bold text-center leading-tight w-full px-0.5"
        style={{ color: badge.unlocked ? 'var(--gym-text)' : 'var(--gym-text-tertiary)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.03em' }}>
        {badge.name.length > 10 ? badge.name.slice(0, 9) + '…' : badge.name}
      </span>

      {/* Rarity chip */}
      <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded-md"
        style={{ background: `${rc}18`, color: rc, border: `1px solid ${rc}28` }}>
        {badge.rarity[0].toUpperCase()}
      </span>
    </motion.button>
  );
}

// ─── Badge Detail Modal ───────────────────────────────────────────────────────

function BadgeModal({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  const rc = RARITY_COLORS[badge.rarity];
  const rg = RARITY_GLOWS[badge.rarity];

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="w-full max-w-sm rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: 'var(--gym-surface-card)',
          border: `1.5px solid ${rc}45`,
          boxShadow: `0 0 60px ${rg}`,
        }}
        initial={{ y: 80, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 80, scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={e => e.stopPropagation()}>

        {/* Glow blob */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% -10%, ${badge.color}18, transparent 60%)` }} />

        {/* Close */}
        <button className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'var(--gym-surface-hover)', border: '1px solid var(--gym-border-bright)' }}
          onClick={onClose}>
          <X size={14} style={{ color: 'var(--gym-text-dim)' }} />
        </button>

        {/* Emblem */}
        <div className="flex justify-center mb-4">
          <motion.div
            animate={badge.unlocked ? { filter: [`drop-shadow(0 0 12px ${rc}60)`, `drop-shadow(0 0 28px ${rc}90)`, `drop-shadow(0 0 12px ${rc}60)`] } : {}}
            transition={{ repeat: Infinity, duration: 2.5 }}>
            <BadgeEmblem badge={badge} size={100} />
          </motion.div>
        </div>

        {/* Rarity pill */}
        <div className="flex justify-center mb-3">
          <span className="text-[10px] font-black px-3 py-1 rounded-full capitalize tracking-widest"
            style={{ background: `${rc}20`, border: `1px solid ${rc}45`, color: rc }}>
            {badge.rarity} award
          </span>
        </div>

        {/* Name & description */}
        <h2 className="text-xl font-black text-center mb-2"
          style={{ color: badge.unlocked ? 'var(--gym-text)' : 'var(--gym-text-tertiary)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
          {badge.name.toUpperCase()}
        </h2>
        <p className="text-sm text-center mb-5 leading-relaxed" style={{ color: 'var(--gym-text-dim)' }}>
          {badge.description}
        </p>

        {/* Status */}
        {badge.unlocked ? (
          <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <p className="text-xs font-black" style={{ color: '#10b981' }}>✓ UNLOCKED</p>
            {badge.unlockedAt && (
              <p className="text-[10px] mt-1" style={{ color: 'var(--gym-text-muted)' }}>
                {new Date(badge.unlockedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl p-4 text-center" style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-2)' }}>
            <p className="text-xs font-black" style={{ color: 'var(--gym-text-tertiary)' }}>🔒 LOCKED</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--gym-text-tertiary)' }}>Complete the challenge to unlock this award</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuestsPage() {
  const { dailyQuests, weeklyQuests, badges, player, completeQuest, syncQuests, subscription } = useStrngthStore();
  const isPremium = deriveIsPremium(subscription);
  const rankCfg = getRankConfig(player.rank);

  // Reflect the latest workout history when the board opens (no active workout).
  useEffect(() => { syncQuests(); }, [syncQuests]);

  const [tab, setTab] = useState<Tab>('daily');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'daily',   label: 'DAILY',   icon: Flame },
    { id: 'weekly',  label: 'WEEKLY',  icon: Zap },
    { id: 'awards',  label: 'AWARDS',  icon: Trophy },
  ];

  const questsByTab = tab === 'daily' ? dailyQuests : weeklyQuests;

  const dailyCompleted = dailyQuests.filter(q => q.completed).length;
  const weeklyCompleted = weeklyQuests.filter(q => q.completed).length;
  const dailyXP = dailyQuests.filter(q => !q.completed).reduce((s, q) => s + q.xpReward, 0);
  const weeklyXP = weeklyQuests.filter(q => !q.completed).reduce((s, q) => s + q.xpReward, 0);

  const filteredBadges = useMemo(() =>
    rarityFilter === 'all' ? badges : badges.filter(b => b.rarity === rarityFilter),
    [badges, rarityFilter]
  );

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="min-h-dvh" style={{ background: 'var(--gym-bg)' }}>

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="px-4 pt-6 pb-0">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[9px] font-black tracking-[0.25em] mb-1" style={{ color: 'var(--gym-text-tertiary)' }}>
            THE HUNTER BOARD
          </p>
          <h1 className="text-2xl font-black mb-1"
            style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', textShadow: `0 0 30px ${rankCfg.color}40` }}>
            QUESTS &amp; AWARDS
          </h1>

          {/* XP status strip */}
          <div className="flex items-center gap-3 mt-2 mb-5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="text-[9px] font-black" style={{ color: '#10b981', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                {dailyCompleted}/{dailyQuests.length} DAILY
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: `${rankCfg.color}12`, border: `1px solid ${rankCfg.color}25` }}>
              <Zap size={9} style={{ color: rankCfg.color }} />
              <span className="text-[9px] font-black" style={{ color: rankCfg.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                {(dailyXP + weeklyXP).toLocaleString()} XP AVAILABLE
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Tab Bar ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <motion.button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl"
                style={{
                  background: active ? `${rankCfg.color}18` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${active ? `${rankCfg.color}50` : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: active ? `0 0 14px ${rankCfg.color}25` : 'none',
                }}
                whileTap={{ scale: 0.94 }}>
                <Icon size={13} style={{ color: active ? rankCfg.color : 'var(--gym-text-muted)' }} />
                <span className="text-[10px] font-black"
                  style={{ color: active ? rankCfg.color : 'var(--gym-text-muted)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.06em' }}>
                  {t.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────── */}
      <div className="px-4 pb-28">
        <AnimatePresence mode="wait">

          {/* ── DAILY / WEEKLY ── */}
          {(tab === 'daily' || tab === 'weekly') && (
            <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-3">

              {!isPremium ? (
                <PremiumGate
                  feature="Quests System"
                  description="Daily and weekly quests are a premium feature. Upgrade to earn XP, track your progress, and climb the ranks."
                />
              ) : (<>

              {/* Stats card */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  {
                    label: 'COMPLETED',
                    value: `${tab === 'daily' ? dailyCompleted : weeklyCompleted}/${tab === 'daily' ? dailyQuests.length : weeklyQuests.length}`,
                    color: '#10b981',
                  },
                  {
                    label: 'XP LEFT',
                    value: `${tab === 'daily' ? dailyXP : weeklyXP}`,
                    color: rankCfg.color,
                  },
                  {
                    label: tab === 'daily' ? 'STREAK' : 'THIS WEEK',
                    value: tab === 'daily' ? `${player.streak}d` : `${weeklyCompleted} done`,
                    color: '#f97316',
                  },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-3 text-center"
                    style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                    <p className="font-black text-base leading-none mb-0.5"
                      style={{ color: s.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>{s.value}</p>
                    <p className="text-[8px] tracking-widest" style={{ color: 'var(--gym-text-tertiary)', letterSpacing: '0.1em' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Quest cards */}
              {questsByTab.map((quest, i) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  index={i}
                  rankColor={rankCfg.color}
                  onClaim={() => completeQuest(quest.id)}
                />
              ))}
              </>)}
            </motion.div>
          )}

          {/* ── AWARDS ── */}
          {tab === 'awards' && (
            <motion.div key="awards" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4">

              {/* Collection header */}
              <div className="rounded-2xl p-4"
                style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy size={13} style={{ color: '#f59e0b' }} />
                    <span className="text-[10px] font-black tracking-widest"
                      style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                      COLLECTION
                    </span>
                  </div>
                  <span className="text-[10px] font-black"
                    style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                    {unlockedCount}/{badges.length} · {Math.round((unlockedCount / badges.length) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--gym-surface-subtle)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)', boxShadow: '0 0 10px rgba(245,158,11,0.5)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(unlockedCount / badges.length) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }} />
                </div>
              </div>

              {/* Rarity filters */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map(r => {
                  const active = rarityFilter === r;
                  const color = r === 'all' ? 'var(--gym-text)' : RARITY_COLORS[r];
                  return (
                    <motion.button key={r} onClick={() => setRarityFilter(r)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black capitalize"
                      style={{
                        background: active ? `${color}20` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? `${color}55` : 'rgba(255,255,255,0.08)'}`,
                        color: active ? color : 'var(--gym-text-muted)',
                        fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                        letterSpacing: '0.07em',
                      }}
                      whileTap={{ scale: 0.93 }}>
                      {r}
                    </motion.button>
                  );
                })}
              </div>

              {/* Badge grid */}
              <div className="grid grid-cols-4 gap-2.5">
                {filteredBadges.map((badge, i) => (
                  <BadgeCard key={badge.id} badge={badge} index={i} onClick={() => setSelectedBadge(badge)} />
                ))}
              </div>

              {filteredBadges.length === 0 && (
                <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--gym-surface-subtle)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Trophy size={28} style={{ color: 'var(--gym-text-tertiary)', margin: '0 auto 8px' }} />
                  <p className="text-xs" style={{ color: 'var(--gym-text-tertiary)' }}>No {rarityFilter} awards yet</p>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Badge Detail Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
