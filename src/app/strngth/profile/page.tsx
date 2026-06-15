'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Dumbbell, Zap, Flame, Trophy, Lock, X, ChevronDown,
  Clock, Bell, Shield, Download, Trash2, BarChart2, ChevronRight, LogOut,
  Check, RotateCcw, Pencil, Camera, Eye, Users, Activity,
  Play, Plus, ArrowLeft, BookOpen, Sun, Moon,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/strngth/firebase';
import { useStrngthStore } from '@/lib/strngth/store';
import type { NotifSettings, PrivacySettings } from '@/lib/strngth/store';
import { getRankConfig, formatXP, timeAgo } from '@/lib/strngth/utils';
import { Badge, Player, WorkoutHistory } from '@/lib/strngth/types';
import { ALL_EXERCISES, MUSCLE_GROUPS, MUSCLE_IMAGES, parseReps } from '@/lib/strngth/exercises';
import AuraRing from '@/components/strngth/ui/AuraRing';
import AnimatedNumber from '@/components/strngth/ui/AnimatedNumber';
import { deriveIsPremium, PLAN_LABELS, PLAN_COLORS, PLAN_ICONS } from '@/lib/strngth/subscription';

// ─── Constants ────────────────────────────────────────────────────────────────

const RARITY_COLORS: Record<Badge['rarity'], string> = {
  common: '#94a3b8', rare: '#3b82f6', epic: '#8b5cf6', legendary: '#f59e0b',
};

const AVATAR_COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6',
  '#10b981', '#00d4ff', '#f97316', '#ec4899',
];

const TABS = [
  { id: 'stats',   label: 'Stats',   icon: BarChart2 },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'awards',  label: 'Awards',  icon: Trophy },
  { id: 'settings',label: 'Settings',icon: Shield },
] as const;
type Tab = typeof TABS[number]['id'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function computeAttributeStats(player: Player, history: WorkoutHistory[]) {
  const avgVol = history.length ? history.reduce((s, w) => s + w.totalVolume, 0) / history.length : 0;
  const avgDurMin = history.length ? history.reduce((s, w) => s + w.duration, 0) / history.length / 60 : 0;
  const avgSets = history.length ? history.reduce((s, w) => s + w.totalSets, 0) / history.length : 0;
  const maxPR = player.personalRecords.length ? Math.max(...player.personalRecords.map(p => p.weight)) : 0;
  return [
    { name: 'Strength',    value: Math.min(100, Math.max(5, Math.round(avgVol / 150))),                                      color: '#ef4444', icon: '⚔️' },
    { name: 'Endurance',   value: Math.min(100, Math.max(5, Math.round(avgDurMin))),                                         color: '#3b82f6', icon: '🛡️' },
    { name: 'Speed',       value: avgDurMin > 0 ? Math.min(100, Math.max(5, Math.round((avgSets / avgDurMin) * 20))) : 5,   color: '#00d4ff', icon: '💨' },
    { name: 'Power',       value: Math.min(100, Math.max(5, Math.round(maxPR / 2.5))),                                       color: '#f97316', icon: '🔥' },
    { name: 'Consistency', value: Math.min(100, Math.max(5, Math.round(Math.min(50, player.streak) + Math.min(50, player.totalWorkouts / 2)))), color: '#10b981', icon: '⚡' },
    { name: 'Recovery',    value: Math.min(100, Math.max(5, Math.round(player.level * 2))),                                  color: '#8b5cf6', icon: '✨' },
  ];
}

function buildHeatmap(history: WorkoutHistory[]) {
  const today = new Date();
  const workoutDates = new Set(history.map(w => w.date.split('T')[0]));
  return Array.from({ length: 70 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (69 - i));
    return { date: d.toISOString().split('T')[0], active: workoutDates.has(d.toISOString().split('T')[0]) };
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WorkoutCard({ workout, index }: { workout: WorkoutHistory; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--gym-border)', background: 'var(--gym-surface-subtle)' }}
    >
      <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left" onClick={() => setExpanded(e => !e)}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <Zap size={16} style={{ color: '#f59e0b' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: 'var(--gym-text)' }}>{workout.planName}</p>
          <p className="text-[11px]" style={{ color: 'var(--gym-text-muted)' }}>{formatDate(workout.date)}</p>
        </div>
        <div className="text-right flex-shrink-0 mr-2">
          <p className="text-xs font-black" style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>+{workout.xpGained} XP</p>
          <p className="text-[10px]" style={{ color: 'var(--gym-text-tertiary)' }}>{formatDuration(workout.duration)}</p>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} style={{ color: 'var(--gym-text-tertiary)' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
            <div className="grid grid-cols-3 gap-2 px-4 pb-4">
              {[
                { label: 'VOLUME',    value: `${(workout.totalVolume / 1000).toFixed(1)}K kg`, color: '#8b5cf6' },
                { label: 'SETS',      value: workout.totalSets.toString(),                     color: '#00d4ff' },
                { label: 'EXERCISES', value: workout.exercises.toString(),                     color: '#10b981' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-2.5 text-center"
                  style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                  <p className="text-xs font-black" style={{ color: s.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>{s.value}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--gym-text-tertiary)', letterSpacing: '0.08em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SettingsRow({ icon: Icon, label, color = 'var(--gym-text)', danger = false, onClick }: {
  icon: React.ElementType; label: string; color?: string; danger?: boolean; onClick?: () => void;
}) {
  return (
    <motion.button
      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left"
      style={{
        background: danger ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
      }}
      whileHover={{ background: danger ? 'rgba(239,68,68,0.09)' : 'rgba(255,255,255,0.07)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.07)', border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.1)'}` }}>
        <Icon size={16} style={{ color: danger ? '#ef4444' : color }} />
      </div>
      <span className="flex-1 text-sm font-semibold" style={{ color: danger ? '#ef4444' : 'var(--gym-text)' }}>{label}</span>
      <ChevronRight size={15} style={{ color: danger ? 'rgba(239,68,68,0.5)' : 'var(--gym-text-tertiary)' }} />
    </motion.button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-widest px-1 mb-2" style={{ color: 'var(--gym-text-tertiary)', letterSpacing: '0.18em' }}>
      {children}
    </p>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0"
      style={{ width: 46, height: 26, borderRadius: 13, background: value ? '#10b981' : 'rgba(255,255,255,0.12)', border: `1px solid ${value ? '#10b981' : 'rgba(255,255,255,0.15)'}`, transition: 'background 0.2s, border-color 0.2s' }}
      whileTap={{ scale: 0.93 }}>
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-full"
        style={{ width: 20, height: 20, background: value ? '#fff' : 'rgba(255,255,255,0.55)', boxShadow: value ? '0 2px 6px rgba(16,185,129,0.45)' : 'none' }}
        animate={{ x: value ? 22 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </motion.button>
  );
}

function ToggleRow({ emoji, label, sub, value, onChange }: { emoji: string; label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
      style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}>
      <span className="text-lg flex-shrink-0 w-7 text-center">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--gym-text)' }}>{label}</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--gym-text-muted)' }}>{sub}</p>
      </div>
      <ToggleSwitch value={value} onChange={onChange} />
    </div>
  );
}

function SheetHeader({ title, icon: Icon, color, onClose }: { title: string; icon: React.ElementType; color: string; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <h2 className="flex-1 text-base font-black tracking-widest"
        style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
        {title}
      </h2>
      <button className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'var(--gym-surface-hover)', border: '1px solid var(--gym-border-bright)' }}
        onClick={onClose}>
        <X size={14} style={{ color: 'var(--gym-text-dim)' }} />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const {
    player, badges, workoutHistory, programs,
    updatePlayer, setAuraColor, saveProgram, deleteProgram, startCustomWorkout,
    notificationSettings, updateNotificationSettings,
    privacySettings, updatePrivacySettings,
    theme, setTheme, logout,
    membershipPlan, setMembershipPlan,
    subscription,
  } = useStrngthStore();
  const isPremium = deriveIsPremium(subscription);
  const router = useRouter();
  const rankCfg = getRankConfig(player.rank);
  const unlockedBadges = badges.filter(b => b.unlocked);

  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  async function handleLogout() {
    setConfirmLogout(false);
    try { await signOut(auth); } catch { /* ignore — sign out locally regardless */ }
    logout();
    router.push('/strngth/signin');
  }
  const [showPremium, setShowPremium] = useState(false);

  // Programs
  const [showPrograms, setShowPrograms] = useState(false);
  const [programsView, setProgramsView] = useState<'list' | 'create'>('list');
  const [newProgramName, setNewProgramName] = useState('');
  const [selectedExIds, setSelectedExIds] = useState<Set<string>>(new Set());
  const [exFilterGroup, setExFilterGroup] = useState('All');
  // Edit Profile
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');

  // Change Avatar
  const [showChangeAvatar, setShowChangeAvatar] = useState(false);
  const [newInitials, setNewInitials] = useState('');
  const [newColor, setNewColor] = useState('');

  // Notification & Privacy sheets
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  function openEditProfile() {
    setEditUsername(player.username);
    setShowEditProfile(true);
  }

  function openChangeAvatar() {
    setNewInitials(player.avatarInitials);
    setNewColor(player.auraColor);
    setShowChangeAvatar(true);
  }

  function saveProfile() {
    const trimmed = editUsername.trim();
    if (trimmed.length < 2) return;
    updatePlayer({ username: trimmed });
    setShowEditProfile(false);
  }

  function saveAvatar() {
    const initials = newInitials.toUpperCase().slice(0, 2);
    if (initials.length < 1) return;
    updatePlayer({ avatarInitials: initials });
    setAuraColor(newColor);
    setShowChangeAvatar(false);
  }

  useEffect(() => { setMounted(true); }, []);

  const attributeStats = useMemo(
    () => mounted ? computeAttributeStats(player, workoutHistory) : [],
    [mounted, player, workoutHistory]
  );

  const heatmap = useMemo(
    () => mounted ? buildHeatmap(workoutHistory) : [],
    [mounted, workoutHistory]
  );

  // XP within current level
  const xpPerLevel = 1500;
  const xpInLevel = player.totalXP % xpPerLevel;
  const xpPct = (xpInLevel / xpPerLevel) * 100;

  const canSave = newProgramName.trim().length >= 2 && selectedExIds.size > 0;

  function handleSaveProgram() {
    if (!canSave) return;
    const exercises = ALL_EXERCISES
      .filter(ex => selectedExIds.has(ex.id))
      .map(ex => ({
        id: ex.id,
        name: ex.name,
        category: ex.muscleGroup.name,
        targetSets: ex.sets,
        targetReps: parseReps(ex.reps),
        xpPerSet: ex.xpPerSet,
      }));
    saveProgram(newProgramName.trim(), exercises);
    setProgramsView('list');
    setNewProgramName('');
    setSelectedExIds(new Set());
  }

  const visibleHistory = showAllHistory ? workoutHistory : workoutHistory.slice(0, 6);

  function handleExportData() {
    const data = JSON.stringify({ player, workoutHistory, badges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'strngth-data.json'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-dvh" style={{ background: 'var(--gym-bg)' }}>

      {/* ── Profile Header ─────────────────────────────────────────────── */}
      <div className="px-4 pt-6 pb-0">
        {/* ── Hero Card ── */}
        <motion.div
          className="relative rounded-3xl overflow-hidden mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: `linear-gradient(145deg, var(--gym-surface-card) 0%, var(--gym-surface-card) 55%, ${rankCfg.color}14 100%)`,
            border: `1px solid ${rankCfg.color}38`,
            boxShadow: `0 0 60px ${rankCfg.color}12, 0 20px 40px rgba(0,0,0,0.5)`,
          }}>

          {/* Layered backgrounds */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 90% -10%, ${rankCfg.color}28, transparent 60%)` }}/>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 10% 110%, ${rankCfg.color}10, transparent 55%)` }}/>
          {/* Subtle grid */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(0deg, ${rankCfg.color}06 0px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, ${rankCfg.color}06 0px, transparent 1px, transparent 28px)`, backgroundSize: '28px 28px' }}/>
          {/* Large rank watermark */}
          <div className="absolute right-5 top-4 font-black leading-none select-none pointer-events-none"
            style={{ color: rankCfg.color, opacity: 0.055, fontSize: 96, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
            {player.rank}
          </div>

          <div className="relative p-5">

            {/* ── Avatar + Info row ── */}
            <div className="flex items-start gap-4 mb-5">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <AuraRing rank={player.rank} color={player.auraColor} intensity="high">
                  <div className="w-[86px] h-[86px] rounded-2xl flex items-center justify-center text-2xl font-black"
                    style={{
                      background: `linear-gradient(145deg, ${rankCfg.color}25, ${rankCfg.color}08)`,
                      border: `2px solid ${rankCfg.color}50`,
                      color: rankCfg.color,
                      fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                      textShadow: `0 0 24px ${rankCfg.color}90`,
                      boxShadow: `inset 0 0 20px ${rankCfg.color}15`,
                    }}>
                    {player.avatarInitials}
                  </div>
                </AuraRing>
                {/* Level overlay */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: rankCfg.color, boxShadow: `0 0 10px ${rankCfg.color}80` }}>
                  <span className="text-[9px] font-black" style={{ color: '#030305', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.05em' }}>
                    LV.{player.level}
                  </span>
                </div>
                {/* Online dot */}
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full"
                  style={{ background: '#10b981', border: '2px solid #07070f', boxShadow: '0 0 8px rgba(16,185,129,0.9)' }}/>
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-black leading-tight"
                    style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.02em', textShadow: '0 0 24px rgba(240,240,255,0.12)' }}>
                    {player.username}
                  </h2>
                  <motion.button onClick={openEditProfile} whileTap={{ scale: 0.88 }}>
                    <Pencil size={13} style={{ color: 'var(--gym-text-tertiary)', flexShrink: 0 }} />
                  </motion.button>
                </div>

                <p className="text-[11px] font-semibold mb-2.5 tracking-wide" style={{ color: rankCfg.color }}>{rankCfg.title}</p>

                {/* Pill row */}
                <div className="flex flex-wrap gap-1.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{ background: `${rankCfg.color}18`, border: `1px solid ${rankCfg.color}40` }}>
                    <span className="text-[11px] font-black" style={{ color: rankCfg.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>{player.rank}</span>
                    <span className="text-[10px] font-medium" style={{ color: `${rankCfg.color}bb` }}>Rank</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)' }}>
                    <Flame size={10} style={{ color: '#f97316' }} />
                    <span className="text-[10px] font-black" style={{ color: '#f97316' }}>{player.streak}d</span>
                  </div>
                  {player.guild && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.28)' }}>
                      <Users size={9} style={{ color: '#8b5cf6' }} />
                      <span className="text-[10px] font-bold truncate max-w-[72px]" style={{ color: '#8b5cf6' }}>{player.guild}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── XP Progress ── */}
            <div className="rounded-2xl px-4 py-3 mb-4"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--gym-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Zap size={12} style={{ color: '#f59e0b' }} />
                  <span className="text-xs font-black" style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                    {xpInLevel.toLocaleString()}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--gym-text-tertiary)' }}>
                    / {xpPerLevel.toLocaleString()} XP
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black" style={{ color: rankCfg.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', textShadow: `0 0 8px ${rankCfg.color}80` }}>
                    {Math.round(xpPct)}%
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--gym-text-tertiary)' }}>to Lv.{player.level + 1}</span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--gym-surface-subtle)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${rankCfg.color}70, ${rankCfg.color})`, boxShadow: `0 0 8px ${rankCfg.color}90` }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1.1, ease: 'easeOut', delay: 0.25 }}
                />
              </div>
            </div>

            {/* ── Bottom stat chips ── */}
            <div className="grid grid-cols-4 gap-2">
              {([
                { icon: Flame,    label: 'STREAK',    value: `${player.streak}d`,                                                        color: '#f97316' },
                { icon: Dumbbell, label: 'WORKOUTS',  value: player.totalWorkouts.toString(),                                            color: '#8b5cf6' },
                { icon: Zap,      label: 'TOTAL XP',  value: formatXP(player.totalXP),                                                  color: '#f59e0b' },
                { icon: Clock,    label: 'LAST WO',   value: player.lastWorkoutDate ? timeAgo(player.lastWorkoutDate) : '—',             color: '#00d4ff' },
              ] as const).map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="rounded-xl p-2.5 flex flex-col items-center gap-1"
                  style={{ background: `${s.color}0d`, border: `1px solid ${s.color}22` }}>
                  <s.icon size={13} style={{ color: s.color }} />
                  <span className="text-[11px] font-black leading-none" style={{ color: s.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                    {s.value}
                  </span>
                  <span className="text-[8px] leading-none text-center" style={{ color: 'var(--gym-text-tertiary)', letterSpacing: '0.05em' }}>
                    {s.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Tab Bar ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-1.5 mb-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-2xl"
                style={{
                  background: active ? `${rankCfg.color}18` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${active ? rankCfg.color + '50' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: active ? `0 0 12px ${rankCfg.color}25` : 'none',
                }}
                whileTap={{ scale: 0.94 }}
              >
                <Icon size={16} style={{ color: active ? rankCfg.color : 'var(--gym-text-muted)' }} />
                <span className="text-[9px] font-bold"
                  style={{ color: active ? rankCfg.color : 'var(--gym-text-muted)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.05em' }}>
                  {tab.label.toUpperCase()}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────── */}
      <div className="px-4 pb-28 mt-4">
        <AnimatePresence mode="wait">

          {/* ── STATS ── */}
          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">

              {/* My Programs card */}
              <motion.button
                className="w-full rounded-2xl p-4 flex items-center gap-3 text-left"
                style={{ background: 'rgba(0,212,255,0.06)', border: '1.5px solid rgba(0,212,255,0.22)', boxShadow: '0 0 24px rgba(0,212,255,0.05)' }}
                whileHover={{ background: 'rgba(0,212,255,0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setShowPrograms(true); setProgramsView('list'); }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)' }}>
                  <Dumbbell size={18} style={{ color: '#00d4ff' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black" style={{ color: '#00d4ff', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>MY PROGRAMS</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--gym-text-muted)' }}>
                    {programs.length === 0 ? 'No programs yet — create your first' : `${programs.length} saved program${programs.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'rgba(0,212,255,0.5)' }} />
              </motion.button>

              {/* Attribute Stats */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <User size={14} style={{ color: '#00d4ff' }} />
                  <h3 className="text-xs font-black tracking-widest" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>ATTRIBUTE STATS</h3>
                </div>
                {!mounted || workoutHistory.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--gym-text-tertiary)' }}>Complete a workout to unlock stats</p>
                ) : (
                  <div className="space-y-3">
                    {attributeStats.map((stat, i) => (
                      <div key={stat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{stat.icon}</span>
                            <span className="text-xs font-medium" style={{ color: 'var(--gym-text-dim)' }}>{stat.name}</span>
                          </div>
                          <span className="text-xs font-black" style={{ color: stat.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                            <AnimatedNumber value={stat.value} duration={700 + i * 80} />
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--gym-surface-subtle)' }}>
                          <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.value}%` }}
                            transition={{ delay: 0.2 + i * 0.07, duration: 0.8, ease: 'easeOut' }}
                            style={{ background: `linear-gradient(90deg, ${stat.color}70, ${stat.color})`, boxShadow: `0 0 6px ${stat.color}50` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consistency Heatmap */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flame size={14} style={{ color: '#10b981' }} />
                    <h3 className="text-xs font-black tracking-widest" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>CONSISTENCY</h3>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: '#10b981' }}>{player.streak}d streak 🔥</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {heatmap.map((day, i) => (
                    <motion.div
                      key={i}
                      className="w-[11px] h-[11px] rounded-sm"
                      style={{ background: day.active ? '#10b981' : 'var(--gym-heatmap-empty)', boxShadow: day.active ? '0 0 4px #10b98180' : 'none' }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.004 }}
                      title={day.date}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[9px]" style={{ color: 'var(--gym-text-tertiary)' }}>10 weeks ago</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--gym-heatmap-empty)' }} />
                    <span className="text-[9px]" style={{ color: 'var(--gym-text-tertiary)' }}>Rest</span>
                    <div className="w-2 h-2 rounded-sm ml-2" style={{ background: '#10b981' }} />
                    <span className="text-[9px]" style={{ color: 'var(--gym-text-tertiary)' }}>Workout</span>
                  </div>
                  <span className="text-[9px]" style={{ color: 'var(--gym-text-tertiary)' }}>Today</span>
                </div>
              </div>

              {/* Personal Records */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={14} style={{ color: '#f59e0b' }} />
                  <h3 className="text-xs font-black tracking-widest" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>PERSONAL RECORDS</h3>
                </div>
                {player.personalRecords.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--gym-text-tertiary)' }}>No PRs yet — log sets to set records</p>
                ) : (
                  <div className="space-y-2">
                    {player.personalRecords.map((pr, i) => (
                      <motion.div key={pr.exercise}
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                        style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.14)' }}>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--gym-text)' }}>{pr.exercise}</p>
                          <p className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>{formatDate(pr.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm" style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>{pr.weight}{pr.unit}</p>
                          <p className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>{pr.reps} rep{pr.reps > 1 ? 's' : ''}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── HISTORY ── */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black tracking-widest" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>WORKOUT HISTORY</h3>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
                  {workoutHistory.length} sessions
                </span>
              </div>

              {workoutHistory.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--gym-surface-subtle)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Dumbbell size={32} style={{ color: 'var(--gym-text-tertiary)', margin: '0 auto 10px' }} />
                  <p className="text-sm" style={{ color: 'var(--gym-text-tertiary)' }}>No workouts yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--gym-text-tertiary)' }}>Finish a workout to see your history</p>
                </div>
              ) : (
                <>
                  {visibleHistory.map((w, i) => <WorkoutCard key={w.id} workout={w} index={i} />)}
                  {workoutHistory.length > 6 && (
                    <motion.button
                      className="w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
                      style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)', color: 'var(--gym-text-dim)' }}
                      whileHover={{ background: 'var(--gym-surface-subtle)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAllHistory(v => !v)}
                    >
                      <ChevronDown size={13} style={{ transform: showAllHistory ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      {showAllHistory ? 'SHOW LESS' : `SHOW ALL ${workoutHistory.length} WORKOUTS`}
                    </motion.button>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── AWARDS ── */}
          {activeTab === 'awards' && (
            <motion.div key="awards" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black tracking-widest" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                  AWARDS ({unlockedBadges.length}/{badges.length})
                </h3>
                <div className="flex items-center gap-1">
                  {(['common','rare','epic','legendary'] as const).map(r => (
                    <span key={r} className="text-[8px] px-1.5 py-0.5 rounded-md font-bold"
                      style={{ background: RARITY_COLORS[r] + '20', color: RARITY_COLORS[r], border: `1px solid ${RARITY_COLORS[r]}35` }}>
                      {r[0].toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {badges.map((badge, i) => {
                  const rc = RARITY_COLORS[badge.rarity];
                  return (
                    <motion.button key={badge.id}
                      initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 380 }}
                      onClick={() => setSelectedBadge(badge)}
                      className="flex flex-col items-center gap-1.5"
                      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl relative"
                        style={{
                          background: badge.unlocked ? `radial-gradient(circle at 35% 35%, ${badge.color}30, ${badge.color}08)` : 'rgba(255,255,255,0.04)',
                          border: `2px solid ${badge.unlocked ? rc : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: badge.unlocked ? `0 0 14px ${rc}50` : 'none',
                          filter: badge.unlocked ? 'none' : 'grayscale(1) brightness(0.35)',
                        }}>
                        <span style={{ fontSize: badge.unlocked ? '1.4rem' : '1.1rem' }}>{badge.icon}</span>
                        {!badge.unlocked && (
                          <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
                            <Lock size={14} style={{ color: 'var(--gym-text-tertiary)' }} />
                          </div>
                        )}
                        {badge.unlocked && (
                          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full"
                            style={{ background: rc, boxShadow: `0 0 6px ${rc}` }} />
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-center leading-tight w-full"
                        style={{ color: badge.unlocked ? 'var(--gym-text)' : 'var(--gym-text-tertiary)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                        {badge.name.length > 10 ? badge.name.slice(0, 9) + '…' : badge.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="rounded-2xl p-4" style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>COLLECTION PROGRESS</span>
                  <span className="text-[10px] font-black" style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                    {Math.round((unlockedBadges.length / badges.length) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--gym-surface-subtle)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(unlockedBadges.length / badges.length) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">

              {/* ACCOUNT */}
              <div>
                <SectionLabel>ACCOUNT</SectionLabel>
                <div className="space-y-2">
                  <SettingsRow icon={User}   label="Edit Profile"  color="#00d4ff" onClick={openEditProfile} />
                  <SettingsRow icon={Camera} label="Change Avatar"  color="#8b5cf6" onClick={openChangeAvatar} />
                  <SettingsRow icon={Bell}   label="Notifications"  color="#f59e0b" onClick={() => setShowNotifications(true)} />
                  <SettingsRow icon={Eye}    label="Privacy"        color="#10b981" onClick={() => setShowPrivacy(true)} />
                </div>
              </div>

              {/* APPEARANCE */}
              <div>
                <SectionLabel>APPEARANCE</SectionLabel>
                <div className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: theme === 'dark' ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.15)', border: `1px solid ${theme === 'dark' ? 'rgba(139,92,246,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                      {theme === 'dark'
                        ? <Moon size={16} style={{ color: '#8b5cf6' }} />
                        : <Sun  size={16} style={{ color: '#f59e0b' }} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--gym-text)' }}>
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--gym-text-muted)' }}>
                        {theme === 'dark' ? 'Easy on the eyes' : 'Bright & clean'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    className="flex items-center gap-1 rounded-xl p-1 relative"
                    style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {(['dark', 'light'] as const).map(t => (
                      <motion.div
                        key={t}
                        className="w-9 h-8 rounded-lg flex items-center justify-center relative z-10"
                        animate={{ color: theme === t ? '#000' : 'var(--gym-text-muted)' }}
                        transition={{ duration: 0.2 }}
                      >
                        {theme === t && (
                          <motion.div
                            layoutId="theme-pill"
                            className="absolute inset-0 rounded-lg"
                            style={{ background: t === 'dark' ? '#8b5cf6' : '#f59e0b' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">
                          {t === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                        </span>
                      </motion.div>
                    ))}
                  </button>
                </div>
              </div>

              {/* DATA */}
              <div>
                <SectionLabel>DATA</SectionLabel>
                <div className="space-y-2">
                  <SettingsRow icon={Download} label="Export Data" color="#00d4ff" onClick={handleExportData} />
                </div>
              </div>

              {/* MEMBERSHIP */}
              <div>
                <SectionLabel>MEMBERSHIP</SectionLabel>
                {(() => {
                  const sub = subscription ?? { isPremium: false, planName: 'free' as const, subscriptionExpiry: null, activatedAt: null };
                  const planName = sub.planName ?? 'free';
                  const planColor = PLAN_COLORS[planName] ?? '#6b7280';
                  const planLabel = PLAN_LABELS[planName] ?? 'Free';
                  const planIcon = PLAN_ICONS[planName] ?? '🔒';
                  const isLight = theme === 'light';
                  const isLifetime = planName === 'lifetime';
                  const expiry = sub.subscriptionExpiry ? new Date(sub.subscriptionExpiry) : null;
                  const isExpired = !isPremium && planName !== 'free' && sub.isPremium;
                  const expiryText = expiry
                    ? expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : null;

                  // Theme-aware tokens
                  const cardBg = isPremium
                    ? isLight
                      ? `linear-gradient(135deg, ${planColor}14, #ffffff)`
                      : `linear-gradient(135deg, ${planColor}18, rgba(10,10,20,0.9))`
                    : isLight ? '#ffffff' : 'var(--gym-surface-subtle)';

                  const cardBorder = isPremium
                    ? `${planColor}${isLight ? '60' : '50'}`
                    : isExpired
                      ? 'rgba(239,68,68,0.35)'
                      : isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

                  const cardShadow = isPremium
                    ? isLight ? `0 4px 24px ${planColor}25` : `0 0 28px ${planColor}14`
                    : isLight ? '0 2px 12px rgba(0,0,0,0.07)' : 'none';

                  const iconBg = isLight ? `${planColor}20` : `${planColor}18`;
                  const iconBorder = isLight ? `${planColor}55` : `${planColor}33`;

                  const ctaBg = isPremium
                    ? isLight ? `${planColor}18` : `${planColor}14`
                    : isLight
                      ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.07))'
                      : 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(239,68,68,0.1))';

                  const ctaBorder = isPremium
                    ? `${planColor}${isLight ? '55' : '44'}`
                    : isLight ? 'rgba(245,158,11,0.55)' : 'rgba(245,158,11,0.45)';

                  return (
                    <div className="rounded-2xl overflow-hidden"
                      style={{ background: cardBg, border: `1.5px solid ${cardBorder}`, boxShadow: cardShadow }}>
                      <div className="p-4">
                        {/* Plan row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
                            style={{ background: iconBg, border: `1px solid ${iconBorder}`, color: planColor }}>
                            {planIcon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black leading-none mb-0.5"
                              style={{ color: isLight ? 'var(--gym-text)' : planColor, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                              {planLabel.toUpperCase()}
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>STRNGTH SUBSCRIPTION</p>
                          </div>
                          {/* Status badge */}
                          {isPremium && (
                            <span className="text-[9px] font-black px-2 py-1 rounded-full flex-shrink-0"
                              style={{
                                color: '#10b981',
                                background: isLight ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.12)',
                                border: `1px solid rgba(16,185,129,${isLight ? '0.4' : '0.3'})`,
                              }}>
                              ✓ ACTIVE
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[9px] font-black px-2 py-1 rounded-full flex-shrink-0"
                              style={{
                                color: '#ef4444',
                                background: isLight ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.12)',
                                border: `1px solid rgba(239,68,68,${isLight ? '0.4' : '0.3'})`,
                              }}>
                              EXPIRED
                            </span>
                          )}
                          {!isPremium && !isExpired && (
                            <span className="text-[9px] font-black px-2 py-1 rounded-full flex-shrink-0"
                              style={{
                                color: isLight ? '#4b5563' : '#6b7280',
                                background: isLight ? 'rgba(75,85,99,0.08)' : 'rgba(107,114,128,0.12)',
                                border: `1px solid rgba(107,114,128,${isLight ? '0.3' : '0.25'})`,
                              }}>
                              FREE
                            </span>
                          )}
                        </div>

                        {/* Expiry / status line */}
                        <p className="text-[11px] mb-3" style={{ color: 'var(--gym-text-dim)' }}>
                          {isPremium && isLifetime && 'Lifetime access · Never expires'}
                          {isPremium && !isLifetime && expiryText && `Expires ${expiryText}`}
                          {isExpired && expiryText && `Expired ${expiryText}`}
                          {!isPremium && !isExpired && 'Upgrade to unlock quests, programs & advanced stats'}
                        </p>

                        {/* CTA — upgrade or manage */}
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setShowPremium(true)}
                          className="w-full py-2.5 rounded-xl font-black text-[11px] tracking-wider flex items-center justify-center gap-1.5"
                          style={{ background: ctaBg, color: isLight ? 'var(--gym-text)' : (isPremium ? planColor : '#f59e0b'), border: `1.5px solid ${ctaBorder}` }}>
                          {isPremium ? 'MANAGE PLAN' : isExpired ? '🔄 RENEW SUBSCRIPTION' : '✨ UPGRADE TO PREMIUM'}
                        </motion.button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* DANGER ZONE */}
              <div>
                <SectionLabel>DANGER ZONE</SectionLabel>
                <div className="space-y-2">
                  <SettingsRow icon={RotateCcw} label="Reset Progress"  danger onClick={() => setConfirmReset(true)} />
                  <SettingsRow icon={LogOut}   label="Log Out"   color="#00d4ff" onClick={() => setConfirmLogout(true)} />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Edit Profile Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowEditProfile(false)}>
            <motion.div className="w-full max-w-sm rounded-t-3xl p-6 pb-10"
              style={{ background: 'var(--gym-surface)', border: '1.5px solid rgba(0,212,255,0.25)', borderBottom: 'none', boxShadow: '0 -20px 60px rgba(0,212,255,0.08)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <SheetHeader title="EDIT PROFILE" icon={User} color="#00d4ff" onClose={() => setShowEditProfile(false)} />

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.14em' }}>USERNAME</p>
                  <input
                    className="w-full px-4 py-3.5 rounded-2xl text-sm font-semibold outline-none"
                    style={{ background: 'var(--gym-surface-subtle)', border: '1.5px solid rgba(0,212,255,0.3)', color: 'var(--gym-text)', caretColor: '#00d4ff' }}
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    placeholder="Enter username..."
                    maxLength={24}
                    autoFocus
                  />
                  <p className="text-[10px] mt-1.5 px-1" style={{ color: 'var(--gym-text-tertiary)' }}>{editUsername.length}/24 characters</p>
                </div>

                <motion.button
                  className="w-full py-4 rounded-2xl font-black text-sm mt-2"
                  style={{
                    background: editUsername.trim().length >= 2 ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${editUsername.trim().length >= 2 ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: editUsername.trim().length >= 2 ? '#00d4ff' : 'var(--gym-text-tertiary)',
                    fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={saveProfile}>
                  SAVE CHANGES
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Change Avatar Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showChangeAvatar && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowChangeAvatar(false)}>
            <motion.div className="w-full max-w-sm rounded-t-3xl p-6 pb-10"
              style={{ background: 'var(--gym-surface)', border: '1.5px solid rgba(139,92,246,0.25)', borderBottom: 'none', boxShadow: '0 -20px 60px rgba(139,92,246,0.08)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <SheetHeader title="CHANGE AVATAR" icon={Camera} color="#8b5cf6" onClose={() => setShowChangeAvatar(false)} />

              {/* Preview */}
              <div className="flex justify-center mb-6">
                <motion.div
                  key={newColor + newInitials}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-black"
                  style={{ background: `${newColor}18`, border: `2px solid ${newColor}60`, color: newColor, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', boxShadow: `0 0 24px ${newColor}40` }}
                  animate={{ scale: [0.9, 1], opacity: [0.6, 1] }}
                  transition={{ duration: 0.2 }}>
                  {newInitials.toUpperCase().slice(0, 2) || '??'}
                </motion.div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.14em' }}>INITIALS (1–2 CHARS)</p>
                  <input
                    className="w-full px-4 py-3.5 rounded-2xl text-sm font-semibold outline-none text-center tracking-widest"
                    style={{ background: 'var(--gym-surface-subtle)', border: '1.5px solid rgba(139,92,246,0.3)', color: 'var(--gym-text)', caretColor: '#8b5cf6', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.3em' }}
                    value={newInitials}
                    onChange={e => setNewInitials(e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="AB"
                    maxLength={2}
                  />
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.14em' }}>AURA COLOR</p>
                  <div className="grid grid-cols-8 gap-2">
                    {AVATAR_COLORS.map(c => (
                      <motion.button key={c}
                        onClick={() => setNewColor(c)}
                        className="w-full aspect-square rounded-full relative"
                        style={{ background: c, boxShadow: newColor === c ? `0 0 12px ${c}` : 'none', border: `2px solid ${newColor === c ? '#fff' : 'transparent'}` }}
                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                        {newColor === c && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check size={10} style={{ color: '#fff' }} />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  className="w-full py-4 rounded-2xl font-black text-sm"
                  style={{
                    background: 'rgba(139,92,246,0.15)',
                    border: '1.5px solid rgba(139,92,246,0.5)',
                    color: '#8b5cf6',
                    fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={saveAvatar}>
                  SAVE AVATAR
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notifications Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowNotifications(false)}>
            <motion.div className="w-full max-w-sm rounded-t-3xl p-6 pb-10"
              style={{ background: 'var(--gym-surface)', border: '1.5px solid rgba(245,158,11,0.25)', borderBottom: 'none', boxShadow: '0 -20px 60px rgba(245,158,11,0.08)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <SheetHeader title="NOTIFICATIONS" icon={Bell} color="#f59e0b" onClose={() => setShowNotifications(false)} />

              <div className="space-y-2">
                {([
                  { key: 'workoutReminders', emoji: '🏋️', label: 'Workout Reminders', sub: 'Daily nudges to hit the gym' },
                  { key: 'questAlerts',      emoji: '⚔️', label: 'Quest Alerts',       sub: 'Notify when quests reset or expire' },
                  { key: 'xpMilestones',     emoji: '⚡', label: 'XP Milestones',      sub: 'Level up and rank-up alerts' },
                  { key: 'streakWarnings',   emoji: '🔥', label: 'Streak Warnings',    sub: 'Alert before your streak breaks' },
                  { key: 'socialActivity',   emoji: '👥', label: 'Social Activity',    sub: 'Likes and comments on your posts' },
                ] as { key: keyof NotifSettings; emoji: string; label: string; sub: string }[]).map(row => (
                  <ToggleRow
                    key={row.key}
                    emoji={row.emoji}
                    label={row.label}
                    sub={row.sub}
                    value={notificationSettings[row.key]}
                    onChange={v => updateNotificationSettings({ [row.key]: v })}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Privacy Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPrivacy(false)}>
            <motion.div className="w-full max-w-sm rounded-t-3xl p-6 pb-10"
              style={{ background: 'var(--gym-surface)', border: '1.5px solid rgba(16,185,129,0.25)', borderBottom: 'none', boxShadow: '0 -20px 60px rgba(16,185,129,0.08)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <SheetHeader title="PRIVACY" icon={Eye} color="#10b981" onClose={() => setShowPrivacy(false)} />

              <div className="space-y-2">
                {([
                  { key: 'publicProfile',        emoji: '👁️', label: 'Public Profile',         sub: 'Anyone can view your profile' },
                  { key: 'showOnLeaderboard',     emoji: '🏆', label: 'Show on Leaderboard',    sub: 'Appear in global rankings' },
                  { key: 'shareWorkoutActivity',  emoji: '📊', label: 'Share Workout Activity', sub: 'Show workouts in the social feed' },
                ] as { key: keyof PrivacySettings; emoji: string; label: string; sub: string }[]).map(row => (
                  <ToggleRow
                    key={row.key}
                    emoji={row.emoji}
                    label={row.label}
                    sub={row.sub}
                    value={privacySettings[row.key]}
                    onChange={v => updatePrivacySettings({ [row.key]: v })}
                  />
                ))}
              </div>

              <div className="mt-4 px-4 py-3.5 rounded-2xl" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="flex items-start gap-2">
                  <Activity size={13} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
                  <p className="text-[10px]" style={{ color: 'var(--gym-text-muted)', lineHeight: 1.5 }}>
                    Your data is never sold. Privacy settings take effect immediately and are stored only on your device.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Badge Detail Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(14px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}>
            <motion.div className="w-full max-w-sm rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: 'var(--gym-surface-card)',
                border: `1.5px solid ${RARITY_COLORS[selectedBadge.rarity]}50`,
                boxShadow: `0 0 60px ${RARITY_COLORS[selectedBadge.rarity]}20`,
              }}
              initial={{ y: 80, scale: 0.92, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 80, scale: 0.92, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={e => e.stopPropagation()}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${selectedBadge.color}15, transparent 65%)` }} />
              <button className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--gym-surface-hover)', border: '1px solid var(--gym-border-bright)' }}
                onClick={() => setSelectedBadge(null)}>
                <X size={14} style={{ color: 'var(--gym-text-dim)' }} />
              </button>
              <div className="flex justify-center mb-5">
                <motion.div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl relative"
                  style={{
                    background: selectedBadge.unlocked ? `radial-gradient(circle at 35% 35%, ${selectedBadge.color}35, ${selectedBadge.color}08)` : 'rgba(255,255,255,0.05)',
                    border: `3px solid ${RARITY_COLORS[selectedBadge.rarity]}`,
                    boxShadow: selectedBadge.unlocked ? `0 0 32px ${RARITY_COLORS[selectedBadge.rarity]}60` : 'none',
                    filter: selectedBadge.unlocked ? 'none' : 'grayscale(1) brightness(0.4)',
                  }}
                  initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                  {selectedBadge.icon}
                  {!selectedBadge.unlocked && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <Lock size={20} style={{ color: 'var(--gym-text-tertiary)' }} />
                    </div>
                  )}
                </motion.div>
              </div>
              <div className="flex justify-center mb-3">
                <span className="text-[10px] font-black px-3 py-1 rounded-full capitalize tracking-widest"
                  style={{ background: `${RARITY_COLORS[selectedBadge.rarity]}20`, border: `1px solid ${RARITY_COLORS[selectedBadge.rarity]}50`, color: RARITY_COLORS[selectedBadge.rarity] }}>
                  {selectedBadge.rarity}
                </span>
              </div>
              <h2 className="text-xl font-black text-center mb-2"
                style={{ color: selectedBadge.unlocked ? 'var(--gym-text)' : 'var(--gym-text-muted)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                {selectedBadge.name.toUpperCase()}
              </h2>
              <p className="text-sm text-center mb-5" style={{ color: 'var(--gym-text-dim)' }}>{selectedBadge.description}</p>
              {selectedBadge.unlocked ? (
                <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                  <p className="text-xs font-bold" style={{ color: '#10b981' }}>✓ UNLOCKED</p>
                  {selectedBadge.unlockedAt && (
                    <p className="text-[10px] mt-1" style={{ color: 'var(--gym-text-muted)' }}>
                      {new Date(selectedBadge.unlockedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-4 text-center" style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-2)' }}>
                  <p className="text-xs font-bold" style={{ color: 'var(--gym-text-tertiary)' }}>🔒 LOCKED</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--gym-text-tertiary)' }}>Complete the challenge to unlock</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Programs Panel ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPrograms && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'var(--gym-bg)' }}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          >
              {/* ── Navigation bar ── */}
              <div
                className="flex items-center gap-3 px-4 flex-shrink-0"
                style={{
                  paddingTop: 'max(env(safe-area-inset-top), 52px)',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  background: 'var(--gym-surface)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {programsView === 'create' ? (
                  <motion.button
                    className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-bright)' }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => { setProgramsView('list'); setNewProgramName(''); setSelectedExIds(new Set()); setExFilterGroup('All'); }}
                  >
                    <ArrowLeft size={16} style={{ color: 'var(--gym-text-dim)' }} />
                  </motion.button>
                ) : (
                  <motion.button
                    className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-bright)' }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setShowPrograms(false)}
                  >
                    <ArrowLeft size={16} style={{ color: 'var(--gym-text-dim)' }} />
                  </motion.button>
                )}

                <div className="flex-1">
                  <p className="text-[10px] font-medium" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.15em' }}>STRNGTH</p>
                  <h1 className="text-lg font-black leading-tight"
                    style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.04em' }}>
                    {programsView === 'create' ? 'CREATE PROGRAM' : 'MY PROGRAMS'}
                  </h1>
                </div>


                {programsView === 'create' && (
                  <motion.button
                    className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-2)' }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setShowPrograms(false)}
                  >
                    <X size={15} style={{ color: 'var(--gym-text-dim)' }} />
                  </motion.button>
                )}
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1" style={{ background: 'var(--gym-bg)' }}>
                <AnimatePresence mode="wait">

                  {/* ── LIST VIEW ── */}
                  {programsView === 'list' && (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                      className="p-4 space-y-2.5 pb-10"
                    >
                      {/* Create new program row */}
                      <motion.button
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left"
                        style={{ background: 'rgba(0,212,255,0.05)', border: '1.5px dashed rgba(0,212,255,0.28)' }}
                        whileHover={{ background: 'rgba(0,212,255,0.09)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setProgramsView('create'); setNewProgramName(''); setSelectedExIds(new Set()); setExFilterGroup('All'); }}
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)' }}>
                          <Plus size={22} style={{ color: '#00d4ff' }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: '#00d4ff' }}>Create new program</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--gym-text-tertiary)' }}>Pick exercises and save as a routine</p>
                        </div>
                      </motion.button>

                      {/* Empty state */}
                      {programs.length === 0 && (
                        <div className="text-center py-12">
                          <BookOpen size={36} style={{ color: 'var(--gym-text-tertiary)', margin: '0 auto 10px' }} />
                          <p className="text-sm" style={{ color: 'var(--gym-text-tertiary)' }}>No programs saved yet</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--gym-text-tertiary)' }}>Create your first program above</p>
                        </div>
                      )}

                      {/* Saved programs */}
                      {programs.map((prog, i) => {
                        const hue = (prog.name.charCodeAt(0) * 47 + 180) % 360;
                        const pc = `hsl(${hue}, 65%, 60%)`;
                        return (
                          <motion.div
                            key={prog.id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-3 px-3.5 py-3 rounded-2xl"
                            style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}
                          >
                            {/* Icon square */}
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-black"
                              style={{ background: `${pc}22`, border: `1px solid ${pc}40`, color: pc, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}
                            >
                              {prog.name.slice(0, 2).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate" style={{ color: 'var(--gym-text)' }}>{prog.name}</p>
                              <p className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>
                                {prog.exercises.length} exercise{prog.exercises.length !== 1 ? 's' : ''} · {timeAgo(prog.createdAt)}
                              </p>
                            </div>

                            {/* Play */}
                            <motion.button
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(16,185,129,0.15)', border: '1.5px solid rgba(16,185,129,0.4)' }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.88 }}
                              onClick={() => {
                                startCustomWorkout(prog.exercises, prog.name);
                                setShowPrograms(false);
                                router.push('/strngth/workout');
                              }}
                            >
                              <Play size={13} style={{ color: '#10b981', marginLeft: 1 }} />
                            </motion.button>

                            {/* Delete */}
                            <motion.button
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}
                              whileTap={{ scale: 0.88 }}
                              onClick={() => deleteProgram(prog.id)}
                            >
                              <Trash2 size={12} style={{ color: '#ef4444' }} />
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* ── CREATE VIEW ── */}
                  {programsView === 'create' && (
                    <motion.div
                      key="create"
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                      className="p-4 pb-10 space-y-4"
                    >
                      {/* Program name */}
                      <div>
                        <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.14em' }}>PROGRAM NAME</p>
                        <input
                          className="w-full px-4 py-3.5 rounded-2xl text-sm font-semibold outline-none"
                          style={{ background: 'var(--gym-surface-subtle)', border: '1.5px solid rgba(0,212,255,0.3)', color: 'var(--gym-text)', caretColor: '#00d4ff' }}
                          value={newProgramName}
                          onChange={e => setNewProgramName(e.target.value)}
                          placeholder="e.g. Push Day, Leg Destroyer..."
                          maxLength={32}
                        />
                      </div>

                      {/* ── Muscle group tab strip (same as workout section) ── */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.14em' }}>SELECT EXERCISES</p>
                          {selectedExIds.size > 0 && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                              style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}>
                              {selectedExIds.size} selected
                            </span>
                          )}
                        </div>

                        {/* Horizontal thumbnail tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {/* ALL tab */}
                          <motion.button
                            className="flex-shrink-0 w-[52px] h-[52px] rounded-2xl flex items-center justify-center"
                            style={{
                              background: exFilterGroup === 'All' ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.06)',
                              border: `1.5px solid ${exFilterGroup === 'All' ? 'rgba(0,212,255,0.65)' : 'rgba(255,255,255,0.12)'}`,
                              boxShadow: exFilterGroup === 'All' ? '0 0 14px rgba(0,212,255,0.35)' : 'none',
                            }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setExFilterGroup('All')}
                          >
                            <Dumbbell size={20} style={{ color: exFilterGroup === 'All' ? '#00d4ff' : 'var(--gym-text-tertiary)' }} />
                          </motion.button>

                          {/* Muscle group thumbnails */}
                          {MUSCLE_GROUPS.map(g => {
                            const active = exFilterGroup === g.id;
                            return (
                              <motion.button
                                key={g.id}
                                className="flex-shrink-0 w-[52px] h-[52px] rounded-2xl overflow-hidden relative"
                                style={{
                                  border: `1.5px solid ${active ? g.color : 'rgba(255,255,255,0.1)'}`,
                                  boxShadow: active ? `0 0 14px ${g.color}55` : 'none',
                                  background: 'rgba(0,0,0,0.5)',
                                }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setExFilterGroup(g.id)}
                              >
                                {MUSCLE_IMAGES[g.id] ? (
                                  <img
                                    src={MUSCLE_IMAGES[g.id]!}
                                    alt={g.name}
                                    className="w-full h-full object-cover object-top"
                                    style={{ opacity: active ? 1 : 0.65 }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: `${g.color}15` }}>💪</div>
                                )}
                                {active && (
                                  <div className="absolute inset-0" style={{ background: `${g.color}22`, boxShadow: `inset 0 0 10px ${g.color}40` }} />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Active group label */}
                        {exFilterGroup !== 'All' && (
                          <p className="text-[10px] font-bold mt-1.5 tracking-wider"
                            style={{ color: MUSCLE_GROUPS.find(g => g.id === exFilterGroup)?.color ?? 'var(--gym-text-muted)', letterSpacing: '0.1em' }}>
                            {MUSCLE_GROUPS.find(g => g.id === exFilterGroup)?.name.toUpperCase()}
                          </p>
                        )}
                      </div>

                      {/* Exercise list */}
                      <div className="space-y-2">
                        {ALL_EXERCISES
                          .filter(ex => exFilterGroup === 'All' || ex.muscleGroup.id === exFilterGroup)
                          .map(ex => {
                            const selected = selectedExIds.has(ex.id);
                            const mc = ex.muscleGroup.color;
                            return (
                              <motion.button
                                key={ex.id}
                                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left"
                                style={{
                                  background: selected ? `${mc}10` : 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${selected ? `${mc}55` : 'rgba(255,255,255,0.08)'}`,
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  setSelectedExIds(prev => {
                                    const next = new Set(prev);
                                    if (next.has(ex.id)) next.delete(ex.id); else next.add(ex.id);
                                    return next;
                                  })
                                }
                              >
                                {/* Muscle PNG thumbnail */}
                                <div className="w-10 h-14 rounded-xl flex-shrink-0 overflow-hidden relative"
                                  style={{ background: theme === 'light' ? '#dde1ee' : 'rgba(0,0,0,0.35)', border: `1px solid ${selected ? `${mc}40` : `${mc}20`}` }}>
                                  {(ex.image ?? MUSCLE_IMAGES[ex.muscleGroup.id]) ? (
                                    <img
                                      src={(ex.image ?? MUSCLE_IMAGES[ex.muscleGroup.id]!).replace(/(-v2)?\.png$/, (_, v2) => theme === 'light' ? `-light${v2 || ''}.png` : `${v2 || ''}.png`)}
                                      alt={ex.name}
                                      className="w-full h-full object-cover object-center"
                                      style={{ opacity: selected ? 1 : 0.75 }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-base" style={{ background: `${mc}15` }}>💪</div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate" style={{ color: selected ? mc : 'var(--gym-text)' }}>{ex.name}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium"
                                      style={{ background: `${mc}15`, color: mc }}>{ex.muscleGroup.name}</span>
                                  </div>
                                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--gym-text-tertiary)' }}>
                                    {ex.sets} sets · {ex.reps} reps
                                  </p>
                                </div>

                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ background: selected ? mc : 'rgba(255,255,255,0.07)', border: `1px solid ${selected ? mc : 'rgba(255,255,255,0.14)'}` }}>
                                  {selected
                                    ? <Check size={11} style={{ color: '#030305' }} />
                                    : <Plus size={11} style={{ color: 'var(--gym-text-muted)' }} />}
                                </div>
                              </motion.button>
                            );
                          })}
                      </div>

                      {/* Save button */}
                      <motion.button
                        className="w-full py-4 rounded-2xl font-black text-sm"
                        style={{
                          background: canSave ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1.5px solid ${canSave ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                          color: canSave ? '#00d4ff' : 'var(--gym-text-tertiary)',
                          fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                        }}
                        whileTap={canSave ? { scale: 0.97 } : {}}
                        onClick={handleSaveProgram}
                      >
                        {canSave ? `SAVE PROGRAM · ${selectedExIds.size} EXERCISES` : 'ADD EXERCISES TO SAVE'}
                      </motion.button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reset Confirm ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmReset && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmReset(false)}>
            <motion.div className="w-full max-w-xs rounded-3xl p-6 text-center"
              style={{ background: 'rgba(13,13,26,0.99)', border: '1.5px solid rgba(239,68,68,0.4)', boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={e => e.stopPropagation()}>
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-base font-black mb-2" style={{ color: '#ef4444', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>RESET PROGRESS</h3>
              <p className="text-xs mb-6" style={{ color: 'var(--gym-text-dim)' }}>This will erase all your XP, levels, workouts, and badges. This cannot be undone.</p>
              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-2xl text-sm font-bold"
                  style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-2)', color: 'var(--gym-text-dim)' }}
                  onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
                <button className="flex-1 py-3 rounded-2xl text-sm font-black"
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1.5px solid rgba(239,68,68,0.5)', color: '#ef4444' }}
                  onClick={() => setConfirmReset(false)}>
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Log Out Confirm ────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmLogout && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmLogout(false)}>
            <motion.div className="w-full max-w-xs rounded-3xl p-6 text-center"
              style={{ background: 'rgba(13,13,26,0.99)', border: '1.5px solid rgba(0,212,255,0.4)', boxShadow: '0 0 40px rgba(0,212,255,0.15)' }}
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={e => e.stopPropagation()}>
              <div className="text-4xl mb-3">👋</div>
              <h3 className="text-base font-black mb-2" style={{ color: '#00d4ff', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>LOG OUT</h3>
              <p className="text-xs mb-6" style={{ color: 'var(--gym-text-dim)' }}>You&apos;ll be signed out and returned to the Sign In screen. Your progress stays saved.</p>
              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-2xl text-sm font-bold"
                  style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-2)', color: 'var(--gym-text-dim)' }}
                  onClick={() => setConfirmLogout(false)}>
                  Cancel
                </button>
                <button className="flex-1 py-3 rounded-2xl text-sm font-black"
                  style={{ background: 'rgba(0,212,255,0.18)', border: '1.5px solid rgba(0,212,255,0.5)', color: '#00d4ff' }}
                  onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Premium Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPremium && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(18px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPremium(false)}>
            <motion.div className="w-full max-w-sm rounded-t-3xl overflow-y-auto relative"
              style={{
                background: 'linear-gradient(180deg, #141020 0%, #0c0c18 100%)',
                border: '1.5px solid rgba(124,58,237,0.25)',
                borderBottom: 'none',
                boxShadow: '0 -20px 60px rgba(124,58,237,0.12)',
                maxHeight: '92dvh',
              }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={e => e.stopPropagation()}>

              {/* Drag handle */}
              <div className="sticky top-0 pt-3 pb-2 flex justify-center" style={{ background: 'inherit' }}>
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>

              {/* Close */}
              <button className="absolute top-3 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
                style={{ background: 'rgba(255,255,255,0.07)' }} onClick={() => setShowPremium(false)}>
                <X size={14} style={{ color: 'var(--gym-text-dim)' }} />
              </button>

              <div className="px-5 pb-10">
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="text-4xl mb-3">👑</div>
                  <h2 className="text-2xl font-black leading-none mb-1" style={{ color: '#f3f4f6', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                    UNLOCK YOUR
                  </h2>
                  <h2 className="text-2xl font-black leading-none mb-2"
                    style={{
                      fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                      background: 'linear-gradient(135deg, #7c3aed, #a78bfa, #00d4ff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                    POTENTIAL
                  </h2>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Choose your path. All features unlocked during beta.</p>
                </div>

                {/* Plan cards */}
                <div className="space-y-3">
                  {([
                    {
                      id: '1month' as const, label: '1 MONTH', icon: '⚡', color: '#00d4ff',
                      price: '₹299', per: '/mo', perLine2: undefined as string | undefined,
                      note: 'Billed monthly', badge: null as string | null, saveBadge: null as string | null,
                      features: ['Full workout tracker','Quest & XP system','Rank progression (E → SSS)','Badge collection','Cloud sync'],
                    },
                    {
                      id: '6month' as const, label: '6 MONTHS', icon: '👑', color: '#7c3aed',
                      price: '₹1,499', per: '/6', perLine2: 'mo',
                      note: '₹249/month · Save ₹295', badge: 'MOST POPULAR', saveBadge: 'SAVE 17%',
                      features: ['Everything in 1 Month','Advanced analytics','Custom workout plans','Full leaderboard access','Priority support'],
                    },
                    {
                      id: 'lifetime' as const, label: 'LIFETIME', icon: '∞', color: '#f59e0b',
                      price: '₹3,999', per: '', perLine2: undefined,
                      note: 'Pay once · Own forever', badge: 'BEST VALUE', saveBadge: 'ONE-TIME',
                      features: ['Everything · Forever','Early feature access','Exclusive SSS aura','Unlimited history','No future charges'],
                    },
                  ]).map((plan, pi) => {
                    const isActive = membershipPlan === plan.id;
                    const highlighted = plan.badge !== null;
                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: pi * 0.08 }}
                        className="rounded-3xl overflow-hidden"
                        style={{
                          background: isActive
                            ? `linear-gradient(145deg, ${plan.color}18 0%, rgba(10,10,20,0.95) 55%)`
                            : highlighted ? `linear-gradient(145deg, ${plan.color}0d 0%, rgba(10,10,20,0.95) 55%)` : 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${isActive ? plan.color + '88' : highlighted ? plan.color + '44' : 'rgba(255,255,255,0.07)'}`,
                          boxShadow: isActive ? `0 0 24px ${plan.color}22` : 'none',
                        }}
                      >
                        <div className="p-4">
                          {/* Label + badge */}
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[10px] font-black tracking-widest"
                              style={{ color: plan.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                              {plan.label}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isActive && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                  style={{ color: plan.color, background: `${plan.color}20`, border: `1px solid ${plan.color}55` }}>
                                  ACTIVE
                                </span>
                              )}
                              {plan.badge && !isActive && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                  style={{ color: plan.color, background: `${plan.color}18`, border: `1px solid ${plan.color}33` }}>
                                  {plan.badge}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price row */}
                          <div className="flex items-start gap-3 mb-1.5">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 font-black"
                              style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}33`, color: plan.color }}>
                              {plan.icon}
                            </div>
                            <div className="flex items-start gap-1 flex-1">
                              <span className="text-[32px] leading-none font-black"
                                style={{ color: plan.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                                {plan.price}
                              </span>
                              {plan.per && (
                                <div className="flex flex-col leading-tight mt-1" style={{ color: '#9ca3af' }}>
                                  <span className="text-xs font-semibold">{plan.per}</span>
                                  {plan.perLine2 && <span className="text-xs font-semibold">{plan.perLine2}</span>}
                                </div>
                              )}
                            </div>
                            {plan.saveBadge && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-lg flex-shrink-0 mt-1"
                                style={{ color: '#10b981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                                {plan.saveBadge}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] mb-3" style={{ color: '#6b7280' }}>{plan.note}</p>

                          {/* Divider */}
                          <div className="h-px mb-3" style={{ background: `linear-gradient(90deg, ${plan.color}33, transparent)` }} />

                          {/* Features */}
                          <div className="space-y-1.5 mb-4">
                            {plan.features.map(f => (
                              <div key={f} className="flex items-center gap-2">
                                <Check size={11} strokeWidth={2.5} style={{ color: plan.color, flexShrink: 0 }} />
                                <span className="text-[12px]" style={{ color: '#d1d5db' }}>{f}</span>
                              </div>
                            ))}
                          </div>

                          {/* CTA */}
                          <motion.button
                            onClick={() => { setMembershipPlan(isActive ? null : plan.id); setShowPremium(false); }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-3 rounded-2xl font-black text-[11px] tracking-widest flex items-center justify-center gap-1.5"
                            style={{
                              background: isActive ? `${plan.color}22` : 'transparent',
                              color: plan.color,
                              border: `1.5px solid ${plan.color}${isActive ? '88' : '66'}`,
                              fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                              boxShadow: isActive ? 'none' : `0 0 12px ${plan.color}14`,
                            }}
                          >
                            {isActive ? (
                              <><Check size={11} strokeWidth={3} /> CURRENT PLAN</>
                            ) : (
                              <>SELECT PLAN <ChevronRight size={12} /></>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <p className="text-center text-[11px] mt-4" style={{ color: '#4b5563' }}>
                  All features unlocked · No payment required during beta
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
