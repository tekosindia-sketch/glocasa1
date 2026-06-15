'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Bell } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useStrngthStore } from '@/lib/strngth/store';
import { getRankConfig } from '@/lib/strngth/utils';
import { buildCalendarFromHistory, getIntensityForDate } from '@/lib/strngth/calendarData';

const HEATMAP_COLORS = [
  'transparent',
  'rgba(0,212,255,0.35)',
  'rgba(0,212,255,0.55)',
  'rgba(0,212,255,0.75)',
  'rgba(0,212,255,1)',
];


export default function TopBar() {
  const { player, calendarOpen, openCalendar, closeCalendar, notifications, notificationsOpen, openNotifications, closeNotifications, workoutHistory } = useStrngthStore();
  const unreadCount = notifications.filter(n => !n.read).length;
  const rankCfg = getRankConfig(player.rank);
  const calMap = useMemo(() => buildCalendarFromHistory(workoutHistory), [workoutHistory]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayIntensity = getIntensityForDate(calMap, todayStr);
  const hasWorkoutToday = todayIntensity > 0;

  return (
    <motion.header
      className="fixed top-0 left-0 lg:left-64 right-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'var(--gym-topbar-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--gym-border)',
      }}
    >
      {/* Left — Avatar + greeting */}
      <Link href="/strngth/profile" className="flex items-center gap-3">
        {/* Avatar with aura */}
        <motion.div className="relative" whileTap={{ scale: 0.92 }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black overflow-hidden"
            style={{
              background: `${rankCfg.color}18`,
              border: `2px solid ${rankCfg.color}`,
              boxShadow: `0 0 12px ${rankCfg.color}50`,
              color: rankCfg.color,
              fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
            }}
          >
            {player.avatarInitials}
          </div>
          {/* Online dot */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{ background: '#10b981', borderColor: 'var(--gym-online-border)' }}
          />
        </motion.div>

        {/* Greeting text */}
        <div>
          <p className="text-[10px] leading-tight" style={{ color: 'var(--gym-text-secondary)' }}>
            Welcome back,
          </p>
          <p className="text-sm font-bold leading-tight" style={{ color: 'var(--gym-text)' }}>
            {player.username}
          </p>
        </div>
      </Link>

      {/* Right — Calendar + Bell */}
      <div className="flex items-center gap-2">

        {/* Calendar button */}
        <motion.button
          className="relative w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: calendarOpen
              ? 'rgba(0,212,255,0.15)'
              : 'var(--gym-surface-subtle)',
            border: calendarOpen
              ? '1px solid rgba(0,212,255,0.4)'
              : '1px solid var(--gym-border-2)',
            boxShadow: calendarOpen ? '0 0 16px rgba(0,212,255,0.25)' : 'none',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => (calendarOpen ? closeCalendar() : openCalendar())}
          aria-label="Open workout calendar"
        >
          <CalendarDays size={17} style={{ color: calendarOpen ? 'var(--gym-cyan)' : 'var(--gym-text-dim)' }} />

          {/* Mini heatmap strip visible on the button face */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-[2px]" suppressHydrationWarning>
            {Array.from({ length: 5 }, (_, idx) => {
              const d = new Date();
              d.setUTCDate(d.getUTCDate() - (4 - idx));
              const intensity = getIntensityForDate(calMap, d.toISOString().slice(0, 10));
              return (
                <div
                  key={idx}
                  className="rounded-full"
                  suppressHydrationWarning
                  style={{
                    width: '4px',
                    height: '4px',
                    background: intensity > 0 ? HEATMAP_COLORS[intensity] : 'var(--gym-border-2)',
                  }}
                />
              );
            })}
          </div>

          {/* Green dot if workout already logged today */}
          <AnimatePresence>
            {hasWorkoutToday && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full border"
                style={{ background: '#10b981', borderColor: 'var(--gym-online-border)', boxShadow: '0 0 6px #10b981' }}
              />
            )}
          </AnimatePresence>
        </motion.button>

        {/* Bell */}
        <motion.button
          className="relative w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: notificationsOpen ? 'rgba(245,158,11,0.15)' : 'var(--gym-surface-subtle)',
            border: notificationsOpen ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--gym-border-2)',
            boxShadow: notificationsOpen ? '0 0 16px rgba(245,158,11,0.25)' : 'none',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Notifications"
          onClick={() => notificationsOpen ? closeNotifications() : openNotifications()}
        >
          <Bell size={17} style={{ color: notificationsOpen ? 'var(--gym-gold)' : 'var(--gym-text-dim)' }} />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-black px-1"
                style={{ background: '#ef4444', color: '#fff', boxShadow: '0 0 8px rgba(239,68,68,0.7)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}
              >
                {unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.header>
  );
}
