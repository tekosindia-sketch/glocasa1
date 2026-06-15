'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Dumbbell, Target, TrendingUp, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useStrngthStore } from '@/lib/strngth/store';
import { getRankConfig, formatXP, RANK_ORDER } from '@/lib/strngth/utils';
import GlassCard from '@/components/strngth/ui/GlassCard';
import StatCard from '@/components/strngth/ui/StatCard';
import MuscleSplitOverview from '@/components/strngth/MuscleSplitOverview';
import Link from 'next/link';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

export default function StrngthDashboard() {
  const { player, dailyQuests, completeQuest, claimDailyCheckIn, syncQuests, lastCheckInDate } = useStrngthStore();

  // Recompute progress from real workout data on every mount (handles the case
  // where the user completed a workout and then navigated back to the dashboard).
  useEffect(() => { syncQuests(); }, [syncQuests]);

  const today = new Date().toISOString().split('T')[0];
  const checkInDoneToday = lastCheckInDate === today;

  const rankCfg = getRankConfig(player.rank);
  const nextRankIndex = RANK_ORDER.indexOf(player.rank) + 1;
  const nextRank = nextRankIndex < RANK_ORDER.length ? RANK_ORDER[nextRankIndex] : null;
  const nextRankCfg = nextRank ? getRankConfig(nextRank) : rankCfg;

  // Level progression (1500 XP per level)
  const XP_PER_LEVEL = 1500;
  const xpInLevel = player.totalXP % XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL - xpInLevel;
  const levelPercent = (xpInLevel / XP_PER_LEVEL) * 100;
  const nextLevel = player.level + 1;
  const levelXPStart = (player.level - 1) * XP_PER_LEVEL;
  const levelXPEnd = player.level * XP_PER_LEVEL;

  const completedQuests = dailyQuests.filter(q => q.completed).length;

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-6xl mx-auto space-y-6">

      {/* Level Progression (hero) */}
      <motion.div {...fadeUp(0)}>
        <div className="rounded-2xl overflow-hidden relative p-4 sm:p-5"
          style={{ background: 'var(--gym-surface-card)', border: '1px solid var(--gym-border)' }}>

          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% -10%, ${rankCfg.color}08, transparent 60%)` }} />

          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm">🏆</span>
              <h2 className="text-[10px] font-black tracking-widest"
                style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                NEXT RANK PROGRESSION
              </h2>
            </div>

            {/* Main row */}
            <div className="flex items-center gap-1 mb-3">

              {/* Current level emblem */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 58 }}>
                <div className="relative">
                  <svg width="48" height="54" viewBox="0 0 64 72">
                    <path d="M32 4 L60 16 L60 44 C60 58 32 68 32 68 C32 68 4 58 4 44 L4 16 Z"
                      fill={`${rankCfg.color}18`} stroke={rankCfg.color} strokeWidth="2" />
                    <text x="32" y="27" textAnchor="middle" fontSize="10" fontWeight="700"
                      fill={`${rankCfg.color}99`} fontFamily="Orbitron, monospace">LVL</text>
                    <text x="32" y="51" textAnchor="middle" fontSize="25" fontWeight="900"
                      fill={rankCfg.color} fontFamily="Orbitron, monospace">{player.level}</text>
                  </svg>
                  <motion.div className="absolute inset-0 pointer-events-none"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{ boxShadow: `0 0 14px ${rankCfg.color}35` }} />
                </div>
                <p className="text-[8px] font-semibold text-center leading-tight" style={{ color: 'var(--gym-text)' }}>{rankCfg.title}</p>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: `${rankCfg.color}18`, border: `1px solid ${rankCfg.color}40`, color: rankCfg.color }}>
                  {rankCfg.label}
                </span>
              </div>

              {/* Arrows left */}
              <div className="flex items-center flex-shrink-0 -mx-0.5">
                {[0, 1].map(i => (
                  <motion.div key={i}
                    animate={{ opacity: [0.2, 0.9, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}>
                    <ChevronRight size={10} style={{ color: rankCfg.color }} />
                  </motion.div>
                ))}
              </div>

              {/* Center */}
              <div className="flex-1 flex flex-col items-center min-w-0 px-1">
                <p className="text-[8px] font-bold tracking-widest" style={{ color: 'var(--gym-text-muted)' }}>LVL</p>
                <motion.p
                  className="text-2xl font-black leading-none"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{ color: rankCfg.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                  {player.level}
                </motion.p>
                <p className="text-sm font-black leading-none mt-1.5"
                  style={{ color: '#f97316', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                  {formatXP(xpToNextLevel)} XP
                </p>
                <p className="text-[8px] font-medium" style={{ color: 'var(--gym-text-muted)' }}>Remaining</p>
              </div>

              {/* Arrows right */}
              <div className="flex items-center flex-shrink-0 -mx-0.5">
                {[0, 1].map(i => (
                  <motion.div key={i}
                    animate={{ opacity: [0.2, 0.9, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}>
                    <ChevronRight size={10} style={{ color: nextRankCfg.color }} />
                  </motion.div>
                ))}
              </div>

              {/* Next level emblem */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 58, opacity: nextRank ? 0.6 : 0.3 }}>
                <svg width="48" height="54" viewBox="0 0 64 72">
                  <path d="M32 4 L60 16 L60 44 C60 58 32 68 32 68 C32 68 4 58 4 44 L4 16 Z"
                    fill={`${nextRankCfg.color}15`} stroke={nextRankCfg.color} strokeWidth="2" strokeDasharray="4 3" />
                  <text x="32" y="27" textAnchor="middle" fontSize="10" fontWeight="700"
                    fill={`${nextRankCfg.color}99`} fontFamily="Orbitron, monospace">LVL</text>
                  <text x="32" y="51" textAnchor="middle" fontSize="25" fontWeight="900"
                    fill={nextRankCfg.color} fontFamily="Orbitron, monospace">{nextLevel}</text>
                </svg>
                <p className="text-[8px] font-semibold text-center leading-tight" style={{ color: 'var(--gym-text)' }}>{nextRankCfg.title}</p>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: `${nextRankCfg.color}15`, border: `1px solid ${nextRankCfg.color}40`, color: nextRankCfg.color }}>
                  {nextRankCfg.label}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--gym-surface-hover)' }}>
                <motion.div className="h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${levelPercent}%` }}
                  transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
                  style={{ background: 'linear-gradient(90deg, #0099cc, #00d4ff)', boxShadow: '0 0 10px rgba(0,212,255,0.45)' }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] font-bold" style={{ color: 'var(--gym-text-muted)' }}>{formatXP(levelXPStart + xpInLevel)} XP</span>
                <span className="text-[9px] font-bold" style={{ color: 'var(--gym-text-muted)' }}>{formatXP(levelXPEnd)} XP</span>
              </div>
            </div>

            {/* Next Rank Rewards */}
            <div className="rounded-xl p-3"
              style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.18)' }}>
              <p className="text-[8px] font-black tracking-widest text-center mb-2.5"
                style={{ color: '#8b5cf6', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                NEXT RANK REWARDS
              </p>
              <div className="flex items-center justify-around">
                {[
                  { icon: '🛡️', label: 'New Badge',       color: '#3b82f6' },
                  { icon: '👑', label: 'Exclusive Title', color: '#8b5cf6' },
                  { icon: '🔮', label: 'Profile Aura',    color: '#f59e0b' },
                ].map((reward, i) => (
                  <div key={reward.label} className="flex items-center gap-2 sm:gap-3">
                    {i > 0 && <div className="w-px h-8" style={{ background: 'rgba(139,92,246,0.2)' }} />}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base flex-shrink-0"
                        style={{ background: `${reward.color}15`, border: `1px solid ${reward.color}30` }}>
                        {reward.icon}
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-semibold leading-tight" style={{ color: 'var(--gym-text)' }}>
                        {reward.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Zap} label="Total XP" value={player.totalXP} color="#00d4ff" glow="rgba(0,212,255,0.4)"
          format={n => formatXP(Math.round(n))} subtext="Lifetime earned" delay={0.1} />
        <StatCard icon={Flame} label="Streak" value={player.streak} suffix="days" color="#f97316" glow="rgba(249,115,22,0.4)"
          subtext="Keep it up!" delay={0.15} />
        <StatCard icon={Dumbbell} label="Workouts" value={player.totalWorkouts} color="#8b5cf6" glow="rgba(139,92,246,0.4)"
          subtext="Total sessions" delay={0.2} />
        <StatCard icon={TrendingUp} label="Total Volume" value={player.totalVolume} suffix="kg" color="#f59e0b" glow="rgba(245,158,11,0.4)"
          format={n => `${(n / 1000).toFixed(0)}K`} subtext="Lifetime kg lifted" delay={0.25} />
      </motion.div>

      {/* Muscle Split Overview */}
      <motion.div {...fadeUp(0.12)}>
        <MuscleSplitOverview />
      </motion.div>

      {/* Daily Quests */}
      <div className="grid grid-cols-1 gap-4">

        {/* Daily Quests */}
        <motion.div {...fadeUp(0.15)} className="lg:col-span-3">
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={16} style={{ color: '#00d4ff' }} />
                <h2 className="text-sm font-bold" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.1em' }}>
                  DAILY QUESTS
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
                  {completedQuests}/{dailyQuests.length}
                </span>
                <Link href="/strngth/quests">
                  <ChevronRight size={16} style={{ color: 'var(--gym-text-tertiary)' }} />
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {dailyQuests.map((quest, i) => {
                const claimable = !quest.completed && quest.progress >= quest.target;
                const pct = Math.min((quest.progress / quest.target) * 100, 100);
                return (
                  <motion.div key={quest.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: quest.completed
                        ? 'rgba(16,185,129,0.06)'
                        : claimable
                        ? 'rgba(245,158,11,0.08)'
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${
                        quest.completed
                          ? 'rgba(16,185,129,0.2)'
                          : claimable
                          ? 'rgba(245,158,11,0.4)'
                          : 'rgba(255,255,255,0.05)'
                      }`,
                      cursor: claimable ? 'pointer' : 'default',
                      boxShadow: claimable ? '0 0 14px rgba(245,158,11,0.1)' : undefined,
                    }}
                    onClick={() => claimable && completeQuest(quest.id)}
                    whileHover={claimable ? { scale: 1.01 } : undefined}
                    whileTap={claimable ? { scale: 0.99 } : undefined}>

                    <div className="text-xl flex-shrink-0">{quest.icon}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold truncate"
                          style={{ color: quest.completed ? '#10b981' : claimable ? '#f59e0b' : 'var(--gym-text)' }}>
                          {quest.title}
                        </span>
                        <span className="text-xs font-bold ml-2 flex-shrink-0"
                          style={{ color: '#00d4ff', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                          +{quest.xpReward} XP
                        </span>
                      </div>
                      <div className="gym-progress">
                        <motion.div className="gym-progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.4 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
                          style={{
                            background: quest.completed
                              ? '#10b981'
                              : claimable
                              ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                              : 'linear-gradient(90deg, #0088aa, #00d4ff)',
                          }} />
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--gym-text-tertiary)' }}>
                        {quest.progress}/{quest.target} · {quest.description}
                      </p>
                    </div>

                    {quest.completed ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
                        <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                      </motion.div>
                    ) : claimable ? (
                      <motion.span
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        className="text-[9px] font-black px-2 py-1 rounded-lg flex-shrink-0"
                        style={{
                          background: 'rgba(245,158,11,0.15)',
                          border: '1px solid rgba(245,158,11,0.45)',
                          color: '#f59e0b',
                          fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                        }}>
                        CLAIM
                      </motion.span>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>

            {/* Daily Check-in — once per calendar day */}
            <motion.button
              className="gym-btn gym-btn-cyan w-full mt-4 py-3"
              whileHover={checkInDoneToday ? undefined : { scale: 1.02 }}
              whileTap={checkInDoneToday ? undefined : { scale: 0.98 }}
              onClick={checkInDoneToday ? undefined : claimDailyCheckIn}
              style={checkInDoneToday ? { opacity: 0.45, cursor: 'default' } : {}}>
              {checkInDoneToday ? '✓ Checked In Today' : '⚡ Daily Check-in (+50 XP)'}
            </motion.button>
          </GlassCard>
        </motion.div>

      </div>
    </div>
  );
}
