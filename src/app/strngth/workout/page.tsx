'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Search, ArrowLeft, Timer, Plus, CheckCircle2, Zap, ChevronRight, Dumbbell, X, MoreHorizontal, FileText, Trash2, AlertTriangle } from 'lucide-react';
import { useStrngthStore } from '@/lib/strngth/store';
import { getRankConfig } from '@/lib/strngth/utils';
import { MUSCLE_GROUPS, MUSCLE_IMAGES, EXERCISE_LIBRARY, ALL_EXERCISES, DIFF_COLORS, LibraryExercise, parseReps, ExBadgeRank, EX_BADGE_CONFIGS, BADGE_IMAGES, getExerciseSets, getExerciseBadgeRank } from '@/lib/strngth/exercises';

// ─── Anatomy SVG ─────────────────────────────────────────────────────────────

const BASE_FILL = 'rgba(255,255,255,0.07)';
const BASE_STROKE = 'rgba(255,255,255,0.12)';
const SW = '0.8';

function BodyBase({ highlights }: { highlights: React.ReactNode }) {
  return (
    <svg viewBox="0 0 80 132" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* head */}
      <ellipse cx="40" cy="11" rx="9" ry="10" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* neck */}
      <path d="M37 21 L43 21 L44 26 L36 26 Z" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* left shoulder */}
      <ellipse cx="17" cy="32" rx="8" ry="5" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* right shoulder */}
      <ellipse cx="63" cy="32" rx="8" ry="5" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* left upper arm */}
      <rect x="10" y="29" width="11" height="24" rx="4" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* right upper arm */}
      <rect x="59" y="29" width="11" height="24" rx="4" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* left forearm */}
      <rect x="9" y="54" width="10" height="19" rx="3" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* right forearm */}
      <rect x="61" y="54" width="10" height="19" rx="3" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* chest left */}
      <path d="M22 28 L40 28 L40 47 L20 47 Z" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* chest right */}
      <path d="M40 28 L58 28 L60 47 L40 47 Z" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* abs */}
      <rect x="23" y="47" width="34" height="22" rx="2" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* hips */}
      <path d="M21 69 L59 69 L56 83 L24 83 Z" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* left thigh */}
      <rect x="23" y="83" width="15" height="27" rx="5" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* right thigh */}
      <rect x="42" y="83" width="15" height="27" rx="5" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* left calf */}
      <rect x="24" y="111" width="13" height="19" rx="4" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* right calf */}
      <rect x="43" y="111" width="13" height="19" rx="4" fill={BASE_FILL} stroke={BASE_STROKE} strokeWidth={SW} />
      {/* highlight layer on top */}
      {highlights}
    </svg>
  );
}

function MuscleDiagram({ group, color }: { group: string; color: string }) {
  const c = color;
  const glow = `drop-shadow(0 0 3px ${color})`;

  const map: Record<string, React.ReactNode> = {
    chest: (
      <>
        <path d="M22 28 L40 28 L40 47 L20 47 Z" fill={c} opacity="0.9" filter={glow} />
        <path d="M40 28 L58 28 L60 47 L40 47 Z" fill={c} opacity="0.9" filter={glow} />
      </>
    ),
    biceps: (
      <>
        <rect x="10" y="29" width="11" height="13" rx="3" fill={c} opacity="0.9" filter={glow} />
        <rect x="59" y="29" width="11" height="13" rx="3" fill={c} opacity="0.9" filter={glow} />
      </>
    ),
    triceps: (
      <>
        <rect x="10" y="42" width="11" height="11" rx="3" fill={c} opacity="0.9" filter={glow} />
        <rect x="59" y="42" width="11" height="11" rx="3" fill={c} opacity="0.9" filter={glow} />
      </>
    ),
    back: (
      <>
        <path d="M22 28 L58 28 L60 47 L20 47 Z" fill={c} opacity="0.75" filter={glow} />
        <rect x="23" y="47" width="34" height="14" rx="2" fill={c} opacity="0.7" filter={glow} />
        <ellipse cx="17" cy="32" rx="8" ry="5" fill={c} opacity="0.6" filter={glow} />
        <ellipse cx="63" cy="32" rx="8" ry="5" fill={c} opacity="0.6" filter={glow} />
      </>
    ),
    shoulders: (
      <>
        <ellipse cx="17" cy="32" rx="8" ry="5" fill={c} opacity="0.9" filter={glow} />
        <ellipse cx="63" cy="32" rx="8" ry="5" fill={c} opacity="0.9" filter={glow} />
        <rect x="10" y="29" width="11" height="8" rx="3" fill={c} opacity="0.6" filter={glow} />
        <rect x="59" y="29" width="11" height="8" rx="3" fill={c} opacity="0.6" filter={glow} />
      </>
    ),
    abs: (
      <rect x="23" y="47" width="34" height="22" rx="2" fill={c} opacity="0.9" filter={glow} />
    ),
    quadriceps: (
      <>
        <rect x="23" y="83" width="15" height="27" rx="5" fill={c} opacity="0.9" filter={glow} />
        <rect x="42" y="83" width="15" height="27" rx="5" fill={c} opacity="0.9" filter={glow} />
      </>
    ),
    hamstrings: (
      <>
        <rect x="23" y="97" width="15" height="13" rx="4" fill={c} opacity="0.9" filter={glow} />
        <rect x="42" y="97" width="15" height="13" rx="4" fill={c} opacity="0.9" filter={glow} />
        <path d="M21 69 L59 69 L56 83 L24 83 Z" fill={c} opacity="0.5" filter={glow} />
      </>
    ),
    hips: (
      <path d="M21 69 L59 69 L56 83 L24 83 Z" fill={c} opacity="0.9" filter={glow} />
    ),
    calves: (
      <>
        <rect x="24" y="111" width="13" height="19" rx="4" fill={c} opacity="0.9" filter={glow} />
        <rect x="43" y="111" width="13" height="19" rx="4" fill={c} opacity="0.9" filter={glow} />
      </>
    ),
    forearms: (
      <>
        <rect x="9" y="54" width="10" height="19" rx="3" fill={c} opacity="0.9" filter={glow} />
        <rect x="61" y="54" width="10" height="19" rx="3" fill={c} opacity="0.9" filter={glow} />
      </>
    ),
    neck: (
      <>
        <path d="M37 21 L43 21 L44 26 L36 26 Z" fill={c} opacity="0.9" filter={glow} />
        <ellipse cx="40" cy="11" rx="9" ry="10" fill={c} opacity="0.3" filter={glow} />
      </>
    ),
  };

  return <BodyBase highlights={map[group] ?? null} />;
}

// ─── Exercise Badge Emblem ────────────────────────────────────────────────────

function ExerciseBadgeEmblem({ rank, size = 40 }: { rank: ExBadgeRank; size?: number }) {
  const cfg = EX_BADGE_CONFIGS.find(b => b.rank === rank)!;
  const glowPx = Math.max(3, size * 0.12);
  const imgSrc = BADGE_IMAGES[rank];

  if (rank === 'none') return (
    <div style={{ width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: size * 0.7, height: size * 0.7, borderRadius: '50%', border: '1.5px dashed rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 2, height: size * 0.3, background: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
      </div>
    </div>
  );

  if (!imgSrc) return null;

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        filter: `drop-shadow(0 0 ${glowPx}px ${cfg.glow}90)`,
      }}
    >
      <Image
        src={imgSrc}
        alt={cfg.label}
        width={size}
        height={size}
        style={{ objectFit: 'contain', width: size, height: size }}
        unoptimized
      />
    </div>
  );
}

// ─── Active Workout Helpers ──────────────────────────────────────────────────

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}


function RestTimerBar() {
  const { activeWorkout, tickRestTimer } = useStrngthStore();
  useEffect(() => {
    if (!activeWorkout?.restTimerActive) return;
    const id = setInterval(tickRestTimer, 1000);
    return () => clearInterval(id);
  }, [activeWorkout?.restTimerActive, tickRestTimer]);
  if (!activeWorkout?.restTimerActive) return null;
  const { restTimerSeconds, restTimerMax } = activeWorkout;
  const pct = (restTimerSeconds / restTimerMax) * 100;
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="p-4 rounded-2xl mb-4" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer size={14} style={{ color: '#00d4ff' }} />
          <span className="text-xs font-semibold" style={{ color: '#00d4ff' }}>REST TIMER</span>
        </div>
        <span className="font-black text-xl" style={{ color: '#00d4ff', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', textShadow: '0 0 12px #00d4ff' }}>{formatTime(restTimerSeconds)}</span>
      </div>
      <div className="gym-progress">
        <motion.div className="gym-progress-fill" animate={{ width: `${pct}%` }} transition={{ duration: 0.9 }}
          style={{ background: pct > 30 ? 'linear-gradient(90deg,#00a8cc,#00d4ff)' : '#f97316', boxShadow: `0 0 8px ${pct > 30 ? '#00d4ff' : '#f97316'}` }} />
      </div>
      {restTimerSeconds === 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs mt-2 font-bold" style={{ color: '#10b981' }}>✅ Rest complete — Attack!</motion.p>
      )}
    </motion.div>
  );
}

// ─── Workout Complete Overlay ─────────────────────────────────────────────────

function WorkoutCompleteOverlay({ onClaim }: { onClaim: () => void }) {
  const { activeWorkout, player } = useStrngthStore();
  if (!activeWorkout) return null;

  const duration = Math.floor((Date.now() - activeWorkout.startedAt) / 1000);
  const totalSets = activeWorkout.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
  const totalTarget = activeWorkout.exercises.reduce((a, ex) => a + ex.targetSets, 0);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl p-6 text-center overflow-hidden relative"
        style={{
          background: 'var(--gym-surface-card)',
          border: '1px solid rgba(245,158,11,0.35)',
          boxShadow: '0 0 80px rgba(245,158,11,0.12), 0 30px 60px rgba(0,0,0,0.6)',
        }}
        initial={{ scale: 0.75, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.75, y: 50 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        {/* Glow blob */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.12), transparent 65%)' }} />

        {/* Trophy */}
        <motion.div
          className="text-6xl mb-3 relative z-10"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.3, 1], rotate: [-20, 10, 0] }}
          transition={{ delay: 0.15, duration: 0.55, ease: 'easeOut' }}
        >🏆</motion.div>

        <p className="text-[10px] font-medium tracking-widest mb-1 relative z-10" style={{ color: 'var(--gym-text-muted)' }}>
          WORKOUT COMPLETE
        </p>
        <h2 className="text-3xl font-black mb-1 relative z-10"
          style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', textShadow: '0 0 24px rgba(245,158,11,0.5)' }}>
          GREAT JOB!
        </h2>
        <p className="text-xs mb-6 relative z-10" style={{ color: 'var(--gym-text-muted)' }}>
          {activeWorkout.planName}
        </p>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 relative z-10">
          {[
            { label: 'XP EARNED', value: `+${activeWorkout.totalXPGained}`, color: '#f59e0b' },
            { label: 'DURATION',  value: formatTime(duration),              color: '#00d4ff' },
            { label: 'SETS DONE', value: `${totalSets}/${totalTarget}`,     color: '#8b5cf6' },
            { label: 'EXERCISES', value: `${activeWorkout.exercises.length}`, color: '#10b981' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl p-3"
              style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}22` }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
            >
              <p className="text-[10px] mb-1" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.1em' }}>{stat.label}</p>
              <p className="text-xl font-black" style={{ color: stat.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Level card */}
        <motion.div
          className="rounded-2xl p-4 mb-6 relative z-10"
          style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <p className="text-[10px] tracking-widest mb-1" style={{ color: 'var(--gym-text-muted)' }}>YOUR LEVEL</p>
          <p className="text-4xl font-black leading-none"
            style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>
            {player.level}
          </p>
          <p className="text-xs mt-1.5" style={{ color: 'var(--gym-text-muted)' }}>
            Rank {player.rank} · {player.totalXP.toLocaleString()} XP total
          </p>
        </motion.div>

        <motion.button
          className="w-full py-4 rounded-2xl font-black text-base relative z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(239,68,68,0.25))',
            border: '1.5px solid rgba(245,158,11,0.55)',
            color: '#f59e0b',
            fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
            letterSpacing: '0.08em',
            boxShadow: '0 0 24px rgba(245,158,11,0.25)',
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 0 36px rgba(245,158,11,0.4)' }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          onClick={onClaim}
        >
          CLAIM XP
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Active Workout View ─────────────────────────────────────────────────────

function SwipeableExerciseCard({ children, onComplete, disabled }: { children: React.ReactNode; onComplete: () => void; disabled: boolean }) {
  const x = useRef(0);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Complete zone on the left */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center rounded-l-2xl"
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        style={{ background: 'rgba(16,185,129,0.2)', pointerEvents: revealed ? 'auto' : 'none' }}
      >
        <div className="flex flex-col items-center gap-1">
          <CheckCircle2 size={22} style={{ color: '#10b981' }} />
          <span className="text-[9px] font-bold" style={{ color: '#10b981', letterSpacing: '0.08em' }}>DONE</span>
        </div>
      </motion.div>

      {/* Draggable card */}
      <motion.div
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 80 }}
        dragElastic={0.05}
        onDrag={(_, info) => { x.current = info.offset.x; }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 50) {
            setRevealed(true);
            onComplete();
            setTimeout(() => setRevealed(false), 600);
          } else {
            setRevealed(false);
          }
        }}
        animate={{ x: revealed ? 80 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        style={{ cursor: disabled ? 'default' : 'grab' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ActiveWorkoutView() {
  const { activeWorkout, player, completeAllSetsForExercise, workoutHistory, setWorkoutNote, discardWorkout, theme } = useStrngthStore();
  const rankCfg = getRankConfig(player.rank);
  void rankCfg;
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!activeWorkout) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - activeWorkout.startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [activeWorkout]);

  if (!activeWorkout) return null;

  const totalCompleted = activeWorkout.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
  const totalTarget = activeWorkout.exercises.reduce((a, ex) => a + ex.targetSets, 0);

  return (
    <div className="space-y-4">
      {/* Session stats */}
      <div className="p-4 rounded-2xl" style={{ background: 'var(--gym-surface-card)', border: `1px solid ${rankCfg.color}30` }}>
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'TIME', value: formatTime(elapsed), color: '#00d4ff' },
            { label: 'SETS', value: `${totalCompleted}/${totalTarget}`, color: '#8b5cf6' },
            { label: 'XP', value: `+${activeWorkout.totalXPGained}`, color: '#f59e0b' },
            { label: 'EX.', value: activeWorkout.exercises.length.toString(), color: '#10b981' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-[10px] mb-0.5" style={{ color: 'var(--gym-text-muted)' }}>{s.label}</p>
              <p className="text-lg font-black" style={{ color: s.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', textShadow: `0 0 8px ${s.color}` }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <RestTimerBar />

      {/* Exercise cards — tap to open detail page */}
      <div className="space-y-3">
        {activeWorkout.exercises.map((ex, i) => {
          const completedSets = ex.sets.filter(s => s.completed).length;
          const isDone = completedSets >= ex.targetSets;
          const mg = MUSCLE_GROUPS.find(g =>
            ex.category.toLowerCase().includes(g.id) ||
            ex.category.toLowerCase().includes(g.name.toLowerCase())
          );
          const accentColor = mg?.color ?? '#00d4ff';
          const exData = ALL_EXERCISES.find(e => e.id === ex.id);
          const baseImg = exData?.image ?? (mg ? MUSCLE_IMAGES[mg.id] : undefined);
          const img = baseImg && theme === 'light' ? baseImg.replace(/(-v2)?\.png$/, (_, v2) => `-light${v2 || ''}.png`) : baseImg;
          const exBadge = getExerciseBadgeRank(getExerciseSets(ex.id, workoutHistory));

          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <SwipeableExerciseCard
                disabled={isDone}
                onComplete={() => completeAllSetsForExercise(ex.id)}
              >
                <div
                  className="rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    border: `1px solid ${isDone ? 'rgba(16,185,129,0.35)' : `${accentColor}20`}`,
                    background: isDone ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
                  }}
                  onClick={() => router.push(`/strngth/workout/exercise/${ex.id}`)}
                >
                  <div className="flex items-center gap-3 p-4">
                    {/* Anatomy thumbnail */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden relative"
                        style={{ background: theme === 'light' ? '#dde1ee' : 'rgba(0,0,0,0.4)', border: `1px solid ${accentColor}25` }}>
                        {img ? (
                          <Image src={img} alt={ex.name} fill className="object-cover object-top"
                            style={{ opacity: isDone ? 0.6 : 0.8 }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">{ex.icon}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm truncate" style={{ color: isDone ? '#10b981' : 'var(--gym-text)' }}>{ex.name}</p>
                        {isDone && <CheckCircle2 size={14} style={{ color: '#10b981' }} />}
                      </div>
                      <p className="text-xs mb-2" style={{ color: 'var(--gym-text-muted)' }}>{ex.category} · {ex.targetSets}×{ex.targetReps}</p>
                      <div className="flex gap-1">
                        {ex.sets.map((set, si) => (
                          <div key={si} className="h-1 flex-1 rounded-full"
                            style={{ background: set.completed ? '#10b981' : 'rgba(255,255,255,0.1)', boxShadow: set.completed ? '0 0 4px #10b981' : 'none' }} />
                        ))}
                      </div>
                    </div>

                    {/* Badge column — right side */}
                    <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: 64 }}>
                      {exBadge !== 'none' ? (
                        <>
                          <ExerciseBadgeEmblem rank={exBadge} size={64} />
                          <p className="text-[10px] font-black mt-0.5 tracking-wider" style={{ color: EX_BADGE_CONFIGS.find(b => b.rank === exBadge)!.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                            {EX_BADGE_CONFIGS.find(b => b.rank === exBadge)!.label.toUpperCase()}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>
                            +{ex.xpPerSet} XP
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-black" style={{ color: isDone ? '#10b981' : accentColor, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                            {completedSets}/{ex.targetSets}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--gym-text-tertiary)' }}>sets</p>
                        </>
                      )}
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--gym-text-tertiary)', flexShrink: 0 }} />
                  </div>
                </div>
              </SwipeableExerciseCard>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        className="gym-btn w-full py-4 text-base mt-2 flex items-center justify-center gap-2"
        style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', boxShadow: '0 0 16px rgba(0,212,255,0.1)' }}
        whileHover={{ scale: 1.01, boxShadow: '0 0 24px rgba(0,212,255,0.25)' }}
        whileTap={{ scale: 0.99 }}
        onClick={() => router.push('/strngth/workout/add-exercises')}
      >
        <Plus size={16} />ADD EXERCISES
      </motion.button>

      {/* MORE button */}
      <motion.button
        className="gym-btn w-full py-3 text-sm flex items-center justify-center gap-2"
        style={{
          background: showMore ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)',
          border: showMore ? '1px solid rgba(139,92,246,0.35)' : '1px solid rgba(255,255,255,0.1)',
          color: showMore ? '#8b5cf6' : 'var(--gym-text-dim)',
          boxShadow: showMore ? '0 0 16px rgba(139,92,246,0.15)' : 'none',
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowMore(v => !v)}
      >
        <MoreHorizontal size={15} />
        MORE
      </motion.button>

      {/* Expandable more menu */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 38 }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 pt-1">
              {/* Add Notes */}
              <motion.button
                className="flex-1 py-3 rounded-2xl flex flex-col items-center gap-1.5"
                style={{
                  background: showNotes ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                  border: showNotes ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.1)',
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setShowNotes(v => !v); setShowDiscard(false); }}
              >
                <FileText size={18} style={{ color: showNotes ? '#f59e0b' : 'var(--gym-text-dim)' }} />
                <span className="text-[11px] font-semibold" style={{ color: showNotes ? '#f59e0b' : 'var(--gym-text-dim)' }}>
                  {activeWorkout.note ? 'EDIT NOTE' : 'ADD NOTE'}
                </span>
              </motion.button>

              {/* Discard Workout */}
              <motion.button
                className="flex-1 py-3 rounded-2xl flex flex-col items-center gap-1.5"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setShowDiscard(true); setShowNotes(false); }}
              >
                <Trash2 size={18} style={{ color: '#ef4444' }} />
                <span className="text-[11px] font-semibold" style={{ color: '#ef4444' }}>DISCARD</span>
              </motion.button>
            </div>

            {/* Inline notes input */}
            <AnimatePresence>
              {showNotes && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}
                >
                  <div className="flex items-center gap-2 px-4 pt-3 pb-2"
                    style={{ borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
                    <FileText size={13} style={{ color: '#f59e0b' }} />
                    <span className="text-xs font-bold tracking-widest" style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                      WORKOUT NOTE
                    </span>
                    <button
                      className="ml-auto w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--gym-surface-hover)' }}
                      onClick={() => setShowNotes(false)}
                    >
                      <X size={11} style={{ color: 'var(--gym-text-dim)' }} />
                    </button>
                  </div>
                  <textarea
                    ref={noteRef}
                    className="w-full bg-transparent px-4 py-3 text-sm resize-none outline-none"
                    style={{ color: 'var(--gym-text)', minHeight: '96px', caretColor: '#f59e0b' }}
                    placeholder="Add a note about this workout…"
                    defaultValue={activeWorkout.note ?? ''}
                    onChange={e => setWorkoutNote(e.target.value)}
                    autoFocus
                  />
                  <div className="px-4 pb-3 flex justify-end">
                    <span className="text-[10px]" style={{ color: 'var(--gym-text-tertiary)' }}>
                      saved automatically
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discard confirmation modal */}
      <AnimatePresence>
        {showDiscard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDiscard(false)}
          >
            <motion.div
              className="w-full max-w-sm rounded-3xl p-6"
              style={{ background: 'rgba(15,8,30,0.98)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}
              initial={{ scale: 0.88, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 20 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}>
                  <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <p className="text-base font-black mb-1" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                    DISCARD WORKOUT?
                  </p>
                  <p className="text-sm" style={{ color: 'var(--gym-text-dim)' }}>
                    All progress will be lost. This cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-1">
                  <motion.button
                    className="flex-1 py-3 rounded-xl text-sm font-bold"
                    style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-bright)', color: 'var(--gym-text-dim)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowDiscard(false)}
                  >
                    KEEP GOING
                  </motion.button>
                  <motion.button
                    className="flex-1 py-3 rounded-xl text-sm font-black"
                    style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444', boxShadow: '0 0 16px rgba(239,68,68,0.2)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { discardWorkout(); router.push('/strngth'); }}
                  >
                    DISCARD
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Exercise Library ────────────────────────────────────────────────────────

function ExerciseDetailSheet({
  exercise,
  muscleGroup,
  isInWorkout,
  hasActiveWorkout,
  onAdd,
  onClose,
}: {
  exercise: LibraryExercise;
  muscleGroup: typeof MUSCLE_GROUPS[number];
  isInWorkout: boolean;
  hasActiveWorkout: boolean;
  onAdd: () => void;
  onClose: () => void;
}) {
  const { workoutHistory, theme } = useStrngthStore();
  const baseImg = exercise.image ?? MUSCLE_IMAGES[muscleGroup.id];
  const img = baseImg && theme === 'light' ? baseImg.replace(/(-v2)?\.png$/, (_, v2) => `-light${v2 || ''}.png`) : baseImg;
  const totalSets = getExerciseSets(exercise.id, workoutHistory);
  const badgeRank = getExerciseBadgeRank(totalSets);
  const badgeCfg = EX_BADGE_CONFIGS.find(b => b.rank === badgeRank)!;
  const badgeIdx = EX_BADGE_CONFIGS.findIndex(b => b.rank === badgeRank);
  const nextCfg = EX_BADGE_CONFIGS[badgeIdx + 1];
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'var(--gym-surface)' }}
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 32 }}>

      {/* Hero image — 45% of screen */}
      <div className="relative flex-shrink-0" style={{ height: '45dvh' }}>
        <div className="absolute inset-0" style={{ background: 'rgba(5,5,15,0.5)' }} />
        {img && (
          <Image src={img} alt={muscleGroup.name} fill
            className="object-cover object-center"
            style={{ opacity: 0.95, filter: `saturate(1.25)` }} />
        )}
        {/* Gradient fade to content */}
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${muscleGroup.color}10 0%, transparent 40%, rgba(8,8,15,0.95) 100%)` }} />

        {/* Close button */}
        <motion.button
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={onClose}>
          <X size={16} style={{ color: 'var(--gym-text)' }} />
        </motion.button>

        {/* Pills over image */}
        <div className="absolute bottom-4 left-5 flex items-center gap-2 z-10">
          <span className="text-[11px] px-2.5 py-1 rounded-lg font-bold"
            style={{ background: `${muscleGroup.color}30`, color: muscleGroup.color, border: `1px solid ${muscleGroup.color}50`, backdropFilter: 'blur(8px)' }}>
            {exercise.category}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-lg font-bold"
            style={{ background: `${DIFF_COLORS[exercise.difficulty]}25`, color: DIFF_COLORS[exercise.difficulty], border: `1px solid ${DIFF_COLORS[exercise.difficulty]}45`, backdropFilter: 'blur(8px)' }}>
            {exercise.difficulty}
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-10"
        style={{ background: 'var(--gym-surface)', borderTop: `1px solid ${muscleGroup.color}20` }}>
          <h2 className="text-xl font-black mb-0.5"
            style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', textShadow: `0 0 20px ${muscleGroup.color}40` }}>
            {exercise.name.toUpperCase()}
          </h2>
          <p className="text-sm mb-4 font-medium" style={{ color: muscleGroup.color }}>{muscleGroup.name}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              { label: 'SETS',   value: exercise.sets.toString(), color: '#8b5cf6' },
              { label: 'REPS',   value: exercise.reps,            color: '#00d4ff' },
              { label: 'XP/SET', value: `+${exercise.xpPerSet}`,  color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center"
                style={{ background: `${s.color}09`, border: `1px solid ${s.color}22` }}>
                <p className="text-base font-black leading-none mb-1"
                  style={{ color: s.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>{s.value}</p>
                <p className="text-[9px] tracking-widest" style={{ color: 'var(--gym-text-tertiary)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Exercise Badge Rank */}
          <div className="rounded-2xl p-3 mb-4 flex items-center gap-3"
            style={{
              background: badgeRank !== 'none' ? `${badgeCfg.color}09` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${badgeRank !== 'none' ? `${badgeCfg.color}25` : 'rgba(255,255,255,0.08)'}`,
            }}>
            <ExerciseBadgeEmblem rank={badgeRank} size={100} />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] tracking-widest mb-0.5" style={{ color: 'var(--gym-text-muted)' }}>EXERCISE RANK</p>
              <p className="text-sm font-black mb-0.5"
                style={{ color: badgeRank === 'none' ? (theme === 'light' ? 'rgba(13,13,26,0.45)' : 'rgba(200,210,230,0.5)') : badgeCfg.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', textShadow: badgeRank !== 'none' ? `0 0 10px ${badgeCfg.glow}70` : 'none' }}>
                {badgeCfg.label.toUpperCase()}
              </p>
              <p className="text-[10px] mb-2" style={{ color: 'var(--gym-text-muted)' }}>
                {totalSets} set{totalSets !== 1 ? 's' : ''} completed
              </p>
              {nextCfg ? (
                <div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--gym-surface-hover)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: badgeRank === 'none' ? (theme === 'light' ? 'rgba(13,13,26,0.2)' : 'rgba(255,255,255,0.18)') : badgeCfg.color }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${Math.min(100, ((totalSets - badgeCfg.min) / (nextCfg.min - badgeCfg.min)) * 100)}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[9px] mt-1" style={{ color: 'var(--gym-text-tertiary)' }}>
                    {nextCfg.min - totalSets} sets to {nextCfg.label}
                  </p>
                </div>
              ) : (
                <p className="text-[9px] font-bold" style={{ color: badgeCfg.color }}>MAX RANK ACHIEVED</p>
              )}
            </div>
          </div>

          {/* Total XP */}
          <div className="rounded-2xl p-3 mb-5 flex items-center gap-2.5"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <Zap size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <p className="text-xs" style={{ color: 'var(--gym-text-dim)' }}>
              Complete all sets to earn{' '}
              <span className="font-black" style={{ color: '#f59e0b' }}>
                +{exercise.xpPerSet * exercise.sets} XP
              </span>
            </p>
          </div>

          {/* CTA */}
          {isInWorkout ? (
            <div className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.3)' }}>
              <CheckCircle2 size={16} style={{ color: '#10b981' }} />
              <span className="font-black text-sm" style={{ color: '#10b981', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                ALREADY IN WORKOUT
              </span>
            </div>
          ) : (
            <motion.button
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm"
              style={{
                background: `linear-gradient(135deg, ${muscleGroup.color}22, ${muscleGroup.color}0e)`,
                border: `1.5px solid ${muscleGroup.color}55`,
                color: muscleGroup.color,
                fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                boxShadow: `0 0 20px ${muscleGroup.color}18`,
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 0 32px ${muscleGroup.color}35` }}
              whileTap={{ scale: 0.97 }}
              onClick={onAdd}>
              <Plus size={16} />
              {hasActiveWorkout ? 'ADD TO WORKOUT' : 'START WORKOUT'}
            </motion.button>
          )}
        </div>
    </motion.div>
  );
}

function ExerciseList({ muscleId, onBack }: { muscleId: string; onBack: () => void }) {
  const { activeWorkout, addExercisesToWorkout, startCustomWorkout, workoutHistory, theme } = useStrngthStore();
  const group = MUSCLE_GROUPS.find(g => g.id === muscleId)!;
  const exercises = EXERCISE_LIBRARY[muscleId] ?? [];
  const [selectedEx, setSelectedEx] = useState<LibraryExercise | null>(null);

  // Real-time: IDs currently in the active workout
  const activeIds = new Set(activeWorkout?.exercises.map(e => e.id) ?? []);

  function handleAdd(ex: LibraryExercise) {
    const payload = [{
      id: ex.id,
      name: ex.name,
      category: group.name,
      targetSets: ex.sets,
      targetReps: parseReps(ex.reps),
      xpPerSet: ex.xpPerSet,
    }];
    if (activeWorkout) {
      addExercisesToWorkout(payload);
    } else {
      startCustomWorkout(payload, ex.name);
    }
    setSelectedEx(null);
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-5">
        <motion.button onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-2)', color: 'var(--gym-text-dim)' }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
          <ArrowLeft size={16} />
        </motion.button>
        <div>
          <p className="text-[10px] font-medium" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.15em' }}>EXERCISE LIBRARY</p>
          <h2 className="text-xl font-black" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>{group.name.toUpperCase()}</h2>
        </div>
      </div>

      <div className="space-y-2">
        {exercises.map((ex, i) => {
          const isAdded = activeIds.has(ex.id);
          const exBadgeRank = getExerciseBadgeRank(getExerciseSets(ex.id, workoutHistory));
          const exBadgeCfg = EX_BADGE_CONFIGS.find(b => b.rank === exBadgeRank)!;
          return (
            <motion.div key={ex.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer"
              style={{
                background: isAdded ? 'rgba(16,185,129,0.05)' : `${group.color}06`,
                border: `1px solid ${isAdded ? 'rgba(16,185,129,0.25)' : `${group.color}18`}`,
              }}
              onClick={() => setSelectedEx(ex)}
              whileHover={{ background: isAdded ? 'rgba(16,185,129,0.08)' : `${group.color}0d`, scale: 1.005 }}
              whileTap={{ scale: 0.98 }}>

              {/* Anatomy thumbnail */}
              <div className="gym-ex-img-wrap w-12 h-16 flex-shrink-0 rounded-xl overflow-hidden relative"
                style={{ background: theme === 'light' ? '#dde1ee' : 'rgba(0,0,0,0.3)', border: `1px solid ${isAdded ? 'rgba(16,185,129,0.3)' : `${group.color}25`}` }}>
                {(ex.image ?? MUSCLE_IMAGES[muscleId]) ? (
                  <Image src={(ex.image ?? MUSCLE_IMAGES[muscleId]!).replace(/(-v2)?\.png$/, (_, v2) => theme === 'light' ? `-light${v2 || ''}.png` : `${v2 || ''}.png`)} alt={ex.name} fill
                    className="object-cover object-center"
                    style={{ opacity: isAdded ? 0.6 : 0.9 }} />
                ) : (
                  <div className="w-full h-full p-1">
                    <MuscleDiagram group={muscleId} color={group.color} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-sm" style={{ color: isAdded ? '#10b981' : 'var(--gym-text)' }}>{ex.name}</p>
                  {isAdded && <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0 }} />}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                    style={{ background: `${group.color}15`, color: group.color }}>
                    {ex.category}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                    style={{ background: `${DIFF_COLORS[ex.difficulty]}15`, color: DIFF_COLORS[ex.difficulty] }}>
                    {ex.difficulty}
                  </span>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>
                  {ex.sets} sets · {ex.reps} reps
                </p>
              </div>

              {/* Right: badge + status */}
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0 min-w-[44px]">
                <ExerciseBadgeEmblem rank={exBadgeRank} size={58} />
                <span className="text-[8px] font-bold leading-none"
                  style={{ color: exBadgeCfg.color, letterSpacing: '0.04em' }}>
                  {exBadgeCfg.label.toUpperCase()}
                </span>
                {isAdded ? (
                  <span className="text-[8px] font-black leading-none" style={{ color: '#10b981' }}>✓ ADDED</span>
                ) : (
                  <span className="text-[8px] leading-none" style={{ color: 'var(--gym-text-tertiary)' }}>+{ex.xpPerSet} XP</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Exercise Detail Sheet */}
      <AnimatePresence>
        {selectedEx && (
          <ExerciseDetailSheet
            exercise={selectedEx}
            muscleGroup={group}
            isInWorkout={activeIds.has(selectedEx.id)}
            hasActiveWorkout={!!activeWorkout}
            onAdd={() => handleAdd(selectedEx)}
            onClose={() => setSelectedEx(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MuscleGroupGrid({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {MUSCLE_GROUPS.map((group, i) => (
        <motion.button key={group.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onSelect(group.id)}
          className="rounded-2xl p-3 flex flex-col items-center gap-2 relative overflow-hidden"
          style={{ background: `${group.color}08`, border: `1px solid ${group.color}20` }}
          whileHover={{ scale: 1.04, background: `${group.color}14`, borderColor: `${group.color}45` }}
          whileTap={{ scale: 0.96 }}>
          {/* Glow blob */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 30%, ${group.color}10, transparent 70%)` }} />
          {/* Anatomy image or SVG */}
          <div className="w-full aspect-[3/4] max-h-20 relative overflow-hidden rounded-xl">
            {MUSCLE_IMAGES[group.id] ? (
              <Image
                src={MUSCLE_IMAGES[group.id]!}
                alt={group.name}
                fill
                className="object-cover object-top"
                style={{ borderRadius: '10px' }}
              />
            ) : (
              <MuscleDiagram group={group.id} color={group.color} />
            )}
          </div>
          {/* Label */}
          <p className="text-[10px] font-bold text-center leading-tight z-10"
            style={{ color: group.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.05em' }}>
            {group.name.toUpperCase()}
          </p>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const { activeWorkout, endWorkout } = useStrngthStore();
  const router = useRouter();
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFinish, setShowFinish] = useState(false);

  // Filter muscle groups by search
  const filteredGroups = MUSCLE_GROUPS.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  // Filter exercises across all groups when searching
  const searchResults = search.trim().length > 0
    ? MUSCLE_GROUPS.flatMap(g =>
        (EXERCISE_LIBRARY[g.id] ?? [])
          .filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()))
          .map(ex => ({ ...ex, muscleGroup: g }))
      )
    : [];

  if (activeWorkout) {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.15em' }}>TRAINING CHAMBER</p>
            <h1 className="text-2xl font-black" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
              {activeWorkout.planName.toUpperCase()}
            </h1>
          </div>
          <motion.button
            className="px-5 py-2.5 rounded-full font-black text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(239,68,68,0.18))',
              border: '1.5px solid rgba(245,158,11,0.5)',
              color: '#f59e0b',
              fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
              letterSpacing: '0.06em',
              boxShadow: '0 0 16px rgba(245,158,11,0.2)',
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 28px rgba(245,158,11,0.35)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFinish(true)}
          >
            FINISH
          </motion.button>
        </motion.div>

        <ActiveWorkoutView />

        <AnimatePresence>
          {showFinish && (
            <WorkoutCompleteOverlay
              onClaim={() => {
                endWorkout();
                setShowFinish(false);
                router.push('/strngth/workout');
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-4xl mx-auto">
      {/* Header row */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.15em' }}>TRAINING CHAMBER</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
            {selectedMuscle ? MUSCLE_GROUPS.find(g => g.id === selectedMuscle)?.name.toUpperCase() : 'EXERCISE LIBRARY'}
          </h1>
        </div>
        {!selectedMuscle && (
          <motion.button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}
            whileHover={{ scale: 1.04, background: 'rgba(0,212,255,0.2)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push('/strngth/workout/add-exercises')}>
            <Plus size={12} />
            ADD EXERCISES
          </motion.button>
        )}
      </motion.div>

      {/* Search bar — only on root library view */}
      {!selectedMuscle && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative mb-5">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gym-text-tertiary)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for exercises..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl text-sm outline-none"
            style={{
              background: 'var(--gym-surface-subtle)',
              border: '1px solid var(--gym-border-2)',
              color: 'var(--gym-text)',
              caretColor: '#00d4ff',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--gym-text-muted)' }}>✕</button>
          )}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {selectedMuscle ? (
          <ExerciseList key="exercise-list" muscleId={selectedMuscle} onBack={() => setSelectedMuscle(null)} />
        ) : search.trim() && searchResults.length > 0 ? (
          <motion.div key="search-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-xs mb-3 font-medium" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.1em' }}>
              {searchResults.length} RESULT{searchResults.length !== 1 ? 'S' : ''}
            </p>
            <div className="space-y-2">
              {searchResults.map((ex, i) => (
                <motion.div key={ex.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer"
                  style={{ background: `${ex.muscleGroup.color}06`, border: `1px solid ${ex.muscleGroup.color}18` }}
                  onClick={() => { setSelectedMuscle(ex.muscleGroup.id); setSearch(''); }}
                  whileHover={{ background: `${ex.muscleGroup.color}0e` }}>
                  <div className="w-10 h-14 flex-shrink-0 rounded-xl overflow-hidden p-1"
                    style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${ex.muscleGroup.color}20` }}>
                    <MuscleDiagram group={ex.muscleGroup.id} color={ex.muscleGroup.color} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: 'var(--gym-text)' }}>{ex.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: ex.muscleGroup.color }}>{ex.muscleGroup.name} · {ex.category}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={10} style={{ color: '#f59e0b' }} />
                    <span className="text-xs font-bold" style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>+{ex.xpPerSet}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : search.trim() && searchResults.length === 0 ? (
          <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <Dumbbell size={32} style={{ color: 'var(--gym-text-tertiary)', margin: '0 auto 12px' }} />
            <p className="text-sm" style={{ color: 'var(--gym-text-muted)' }}>No exercises found for "{search}"</p>
          </motion.div>
        ) : (
          <motion.div key="muscle-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.1em' }}>MUSCLE GROUPS</p>
              <span className="text-xs" style={{ color: 'var(--gym-text-tertiary)' }}>{filteredGroups.length} groups</span>
            </div>
            <MuscleGroupGrid onSelect={setSelectedMuscle} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
