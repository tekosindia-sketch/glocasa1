'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Clock, Zap, Dumbbell, TrendingUp, Star } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useStrngthStore } from '@/lib/strngth/store';
import { buildCalendarFromHistory, getWorkoutForDate, getIntensityForDate, getMonthStats, CalendarWorkout } from '@/lib/strngth/calendarData';

const HEATMAP_BG_DARK = [
  'rgba(255,255,255,0.04)',
  'rgba(0,212,255,0.14)',
  'rgba(0,212,255,0.32)',
  'rgba(0,212,255,0.56)',
  'rgba(0,212,255,0.82)',
];
const HEATMAP_BORDER_DARK = [
  'rgba(255,255,255,0.06)',
  'rgba(0,212,255,0.25)',
  'rgba(0,212,255,0.4)',
  'rgba(0,212,255,0.55)',
  'rgba(0,212,255,0.75)',
];
const HEATMAP_TEXT_DARK = ['rgba(240,240,255,0.3)', '#00d4ff', '#00d4ff', '#030305', '#030305'];

const HEATMAP_BG_LIGHT = [
  'rgba(0,100,180,0.07)',
  'rgba(0,160,210,0.22)',
  'rgba(0,140,200,0.42)',
  'rgba(0,110,180,0.64)',
  'rgba(0,80,155,0.85)',
];
const HEATMAP_BORDER_LIGHT = [
  'rgba(0,100,180,0.2)',
  'rgba(0,160,210,0.45)',
  'rgba(0,140,200,0.6)',
  'rgba(0,110,180,0.75)',
  'rgba(0,80,155,0.9)',
];
const HEATMAP_TEXT_LIGHT = ['rgba(13,13,26,0.5)', '#0068a0', '#00527a', '#f0f0ff', '#f0f0ff'];

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function WorkoutDetail({ workout, isLight }: { workout: CalendarWorkout; isLight: boolean }) {
  const divider  = isLight ? 'rgba(0,0,0,0.09)'   : 'rgba(255,255,255,0.06)';
  const rowAlt   = isLight ? 'rgba(0,0,0,0.025)'  : 'rgba(255,255,255,0.01)';
  const cardBg   = isLight ? 'rgba(0,120,200,0.06)' : 'rgba(0,212,255,0.04)';
  const cardBdr  = isLight ? 'rgba(0,120,200,0.22)' : 'rgba(0,212,255,0.18)';
  const xpColor  = isLight ? '#005f8a' : '#00d4ff';
  const date = new Date(workout.date + 'T12:00:00');
  const weekday = date.toLocaleDateString('en', { weekday: 'long' });
  const formatted = date.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="mt-4 rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${cardBdr}`, background: cardBg }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${divider}` }}>
        <div>
          <p className="text-xs font-bold" style={{ color: '#00d4ff', fontFamily: 'var(--gym-font-display-loaded,Orbitron,monospace)', letterSpacing: '0.08em' }}>
            {weekday.toUpperCase()}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--gym-text-secondary)' }}>{formatted}</p>
        </div>
        <div className="flex items-center gap-3">
          {workout.isPR && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Star size={9} /> PR DAY
            </span>
          )}
          <span className="font-black text-sm" style={{ color: xpColor, fontFamily: 'var(--gym-font-display-loaded,Orbitron,monospace)' }}>
            +{workout.xpGained} XP
          </span>
        </div>
      </div>

      {/* Plan + meta row */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${divider}` }}>
        <p className="font-bold text-sm mb-2" style={{ color: 'var(--gym-text)' }}>{workout.planName}</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gym-text-dim)' }}>
            <Clock size={12} style={{ color: '#00d4ff' }} />
            {formatDuration(workout.duration)}
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gym-text-dim)' }}>
            <Dumbbell size={12} style={{ color: '#8b5cf6' }} />
            {(workout.totalVolume / 1000).toFixed(1)}K kg
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gym-text-dim)' }}>
            <TrendingUp size={12} style={{ color: '#f59e0b' }} />
            {workout.exercises.length} exercises
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gym-text-dim)' }}>
            <Zap size={12} style={{ color: '#f97316' }} />
            {workout.exercises.reduce((a, e) => a + e.sets.length, 0)} total sets
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="px-4 py-3 max-h-64 overflow-y-auto space-y-3">
        {workout.exercises.map((ex, ei) => (
          <div key={ei}>
            {/* Exercise header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{ex.icon}</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--gym-text)' }}>{ex.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--gym-text-tertiary)' }}>{ex.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold" style={{ color: xpColor }}>
                  Best: {ex.bestSet.weight}kg × {ex.bestSet.reps}
                </p>
                <p className="text-[9px]" style={{ color: 'var(--gym-text-tertiary)' }}>
                  Vol: {(ex.totalVolume / 1000).toFixed(1)}K kg
                </p>
              </div>
            </div>

            {/* Sets table */}
            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${divider}` }}>
              <div className="grid grid-cols-3 px-3 py-1.5" style={{ background: 'var(--gym-surface-subtle)' }}>
                {['SET', 'WEIGHT', 'REPS'].map(h => (
                  <span key={h} className="text-[9px] font-bold" style={{ color: 'var(--gym-text-tertiary)', fontFamily: 'var(--gym-font-display-loaded,Orbitron,monospace)' }}>{h}</span>
                ))}
              </div>
              {ex.sets.map((set, si) => (
                <div key={si} className="grid grid-cols-3 px-3 py-1.5"
                  style={{ borderTop: `1px solid ${divider}`, background: si % 2 === 0 ? 'transparent' : rowAlt }}>
                  <span className="text-[11px] font-bold" style={{ color: 'var(--gym-text-secondary)' }}>#{si + 1}</span>
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--gym-text)' }}>{set.weight} kg</span>
                  <span className="text-[11px] font-semibold" style={{ color: xpColor }}>{set.reps}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RestDayDetail({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr + 'T12:00:00');
  const weekday = date.toLocaleDateString('en', { weekday: 'long' });
  const formatted = date.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-4 rounded-2xl p-4 text-center"
      style={{ border: '1px solid var(--gym-border)', background: 'rgba(255,255,255,0.02)' }}
    >
      <p className="text-2xl mb-2">😴</p>
      <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--gym-text)' }}>{weekday}</p>
      <p className="text-xs mb-2" style={{ color: 'var(--gym-text-muted)' }}>{formatted}</p>
      <p className="text-xs" style={{ color: 'var(--gym-text-tertiary)' }}>Rest day — recovery is part of the grind.</p>
    </motion.div>
  );
}

export default function CalendarPanel() {
  const { calendarOpen, closeCalendar, selectedDate, selectDate, player, theme, workoutHistory } = useStrngthStore();
  const calMap = useMemo(() => buildCalendarFromHistory(workoutHistory), [workoutHistory]);
  const isLight = theme === 'light';

  const HEATMAP_BG     = isLight ? HEATMAP_BG_LIGHT     : HEATMAP_BG_DARK;
  const HEATMAP_BORDER = isLight ? HEATMAP_BORDER_LIGHT : HEATMAP_BORDER_DARK;
  const HEATMAP_TEXT   = isLight ? HEATMAP_TEXT_LIGHT   : HEATMAP_TEXT_DARK;

  // Surface / border tokens that differ between themes
  const S = {
    btnBg:      isLight ? 'rgba(0,0,0,0.05)'          : 'rgba(255,255,255,0.05)',
    btnBorder:  isLight ? 'rgba(0,0,0,0.12)'          : 'rgba(255,255,255,0.08)',
    divider:    isLight ? 'rgba(0,0,0,0.09)'          : 'rgba(255,255,255,0.06)',
    rowAlt:     isLight ? 'rgba(0,0,0,0.025)'         : 'rgba(255,255,255,0.01)',
    closeBg:    isLight ? 'rgba(0,0,0,0.05)'          : 'rgba(255,255,255,0.04)',
    closeBorder:isLight ? 'rgba(0,0,0,0.12)'          : 'rgba(255,255,255,0.08)',
    panelShadow:isLight ? '0 20px 60px rgba(0,0,0,0.15)' : '0 20px 60px rgba(0,0,0,0.6)',
    workoutCard:isLight ? 'rgba(0,120,200,0.06)'      : 'rgba(0,212,255,0.04)',
    workoutCardBorder: isLight ? 'rgba(0,120,200,0.22)' : 'rgba(0,212,255,0.18)',
    xpColor:    isLight ? '#005f8a'                   : '#00d4ff',
  };


  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const todayStr = today.toISOString().slice(0, 10);
  const monthStats = getMonthStats(calMap, viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    const now = new Date();
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(viewYear, viewMonth, i + 1);
      return d.toISOString().slice(0, 10);
    }),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedWorkout = selectedDate ? getWorkoutForDate(calMap, selectedDate) : null;
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const isFutureMonth = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <AnimatePresence>
      {calendarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'var(--gym-overlay)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCalendar}
          />

          {/* Panel — slides down from top */}
          <motion.div
            className="fixed left-0 lg:left-64 right-0 top-16 z-50 overflow-y-auto"
            style={{
              maxHeight: 'calc(100dvh - 64px)',
              background: 'var(--gym-surface-card)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(0,212,255,0.15)',
              boxShadow: S.panelShadow,
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            <div className="max-w-xl mx-auto px-4 py-5">

              {/* Month navigation header */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: S.btnBg, border: `1px solid ${S.btnBorder}` }}>
                  <ChevronLeft size={15} style={{ color: 'var(--gym-text-dim)' }} />
                </button>

                <div className="text-center">
                  <h2 className="font-black text-base" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded,Orbitron,monospace)', letterSpacing: '0.12em' }}>
                    {MONTHS[viewMonth].toUpperCase()} {viewYear}
                  </h2>
                </div>

                <button onClick={nextMonth}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: S.btnBg,
                    border: `1px solid ${S.btnBorder}`,
                    opacity: isFutureMonth ? 0.3 : 1,
                  }}
                  disabled={isFutureMonth}>
                  <ChevronRight size={15} style={{ color: 'var(--gym-text-dim)' }} />
                </button>
              </div>

              {/* Month stats */}
              <div className="flex gap-3 mb-4">
                {[
                  { label: 'Workouts', value: monthStats.workouts.toString(), color: '#00d4ff' },
                  { label: 'XP Earned', value: `${(monthStats.totalXP / 1000).toFixed(1)}K`, color: '#f59e0b' },
                  { label: 'Volume', value: `${(monthStats.totalVolume / 1000).toFixed(0)}K kg`, color: '#8b5cf6' },
                  { label: '🔥 Streak', value: `${player.streak}d`, color: '#f97316' },
                ].map(s => (
                  <div key={s.label} className="flex-1 rounded-xl p-2 text-center"
                    style={{ background: `${s.color}0a`, border: `1px solid ${s.color}20` }}>
                    <p className="font-black text-sm leading-none" style={{ color: s.color, fontFamily: 'var(--gym-font-display-loaded,Orbitron,monospace)' }}>{s.value}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: 'var(--gym-text-tertiary)' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-1.5">
                {DAYS_SHORT.map(d => (
                  <div key={d} className="text-center py-1">
                    <span className="text-[10px] font-bold" style={{ color: 'var(--gym-text-tertiary)', fontFamily: 'var(--gym-font-display-loaded,Orbitron,monospace)' }}>{d[0]}</span>
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((dateStr, idx) => {
                  if (!dateStr) return <div key={idx} />;

                  const intensity = getIntensityForDate(calMap, dateStr);
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  const isFuture = dateStr > todayStr;
                  const dayNum = new Date(dateStr + 'T12:00:00').getDate();

                  return (
                    <motion.button
                      key={dateStr}
                      onClick={() => !isFuture && selectDate(isSelected ? null : dateStr)}
                      disabled={isFuture}
                      className="relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 overflow-hidden"
                      style={{
                        background: isSelected
                          ? 'rgba(245,158,11,0.2)'
                          : HEATMAP_BG[intensity],
                        border: isSelected
                          ? '1.5px solid rgba(245,158,11,0.7)'
                          : isToday
                          ? '1.5px solid rgba(0,212,255,0.6)'
                          : `1px solid ${HEATMAP_BORDER[intensity]}`,
                        boxShadow: isSelected
                          ? '0 0 12px rgba(245,158,11,0.3)'
                          : isToday
                          ? '0 0 10px rgba(0,212,255,0.2)'
                          : intensity >= 3
                          ? `0 0 8px ${HEATMAP_BG[intensity]}`
                          : 'none',
                        opacity: isFuture ? 0.2 : 1,
                        cursor: isFuture ? 'not-allowed' : 'pointer',
                      }}
                      whileHover={!isFuture ? { scale: 1.08 } : {}}
                      whileTap={!isFuture ? { scale: 0.94 } : {}}
                    >
                      <span
                        className="text-xs font-bold leading-none"
                        style={{ color: isSelected ? '#f59e0b' : HEATMAP_TEXT[intensity] }}
                      >
                        {dayNum}
                      </span>

                      {/* XP dot for workout days */}
                      {intensity > 0 && (
                        <div
                          className="w-1 h-1 rounded-full"
                          style={{
                            background: intensity >= 3
                              ? (isLight ? 'rgba(255,255,255,0.7)' : 'rgba(3,3,5,0.6)')
                              : (isLight ? '#005f8a' : '#00d4ff'),
                            opacity: 0.8,
                          }}
                        />
                      )}

                      {/* Today ring */}
                      {isToday && (
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          style={{ border: '1.5px solid rgba(0,212,255,0.5)' }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Heatmap legend */}
              <div className="flex items-center justify-end gap-2 mt-3 mb-2">
                <span className="text-[9px]" style={{ color: 'var(--gym-text-tertiary)' }}>Rest</span>
                {HEATMAP_BG.map((bg, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded" style={{ background: bg, border: `1px solid ${HEATMAP_BORDER[i]}` }} />
                ))}
                <span className="text-[9px]" style={{ color: 'var(--gym-text-tertiary)' }}>Intense</span>
              </div>

              {/* Day detail */}
              <AnimatePresence mode="wait">
                {selectedDate && (
                  selectedWorkout
                    ? <WorkoutDetail key={selectedDate} workout={selectedWorkout} isLight={isLight} />
                    : <RestDayDetail key={selectedDate + '-rest'} dateStr={selectedDate} />
                )}
              </AnimatePresence>

              {/* Close button */}
              <motion.button
                className="w-full mt-5 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                style={{
                  background: S.closeBg,
                  border: `1px solid ${S.closeBorder}`,
                  color: 'var(--gym-text-dim)',
                  fontFamily: 'var(--gym-font-display-loaded,Orbitron,monospace)',
                  letterSpacing: '0.1em',
                }}
                whileHover={{ background: 'var(--gym-surface-hover)' }}
                whileTap={{ scale: 0.98 }}
                onClick={closeCalendar}
              >
                <X size={13} /> CLOSE
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
