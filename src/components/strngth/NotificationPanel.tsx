'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCheck } from 'lucide-react';
import { useStrngthStore } from '@/lib/strngth/store';
import { GymNotification } from '@/lib/strngth/types';

function timeAgoShort(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

function NotifItem({ notif }: { notif: GymNotification }) {
  const { markNotificationRead } = useStrngthStore();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => markNotificationRead(notif.id)}
      className="flex items-start gap-3 px-4 py-3 cursor-pointer relative"
      style={{
        background: notif.read ? 'transparent' : `${notif.color}08`,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
      whileHover={{ background: 'var(--gym-surface-subtle)' }}
    >
      {/* Unread dot */}
      {!notif.read && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full"
          style={{ background: notif.color, boxShadow: `0 0 6px ${notif.color}` }}
        />
      )}

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5"
        style={{ background: `${notif.color}15`, border: `1px solid ${notif.color}30` }}
      >
        {notif.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-bold mb-0.5 truncate"
          style={{ color: notif.read ? 'var(--gym-text-dim)' : 'var(--gym-text)' }}
        >
          {notif.title}
        </p>
        <p className="text-[11px] leading-snug" style={{ color: 'var(--gym-text-secondary)' }}>
          {notif.body}
        </p>
        <p className="text-[10px] mt-1" style={{ color: `${notif.color}90` }}>
          {timeAgoShort(notif.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

export default function NotificationPanel() {
  const { notificationsOpen, closeNotifications, notifications, markAllNotificationsRead } = useStrngthStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={closeNotifications}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 z-50 w-80 rounded-2xl overflow-hidden"
            style={{
              top: '72px',
              background: 'var(--gym-nav-bg)',
              border: '1px solid var(--gym-border-2)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <Bell size={14} style={{ color: '#f59e0b' }} />
                <span
                  className="text-sm font-black"
                  style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.08em' }}
                >
                  ALERTS
                </span>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: '#ef4444', color: '#fff', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
                    style={{ color: '#00d4ff', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}
                  >
                    <CheckCheck size={11} />
                    All read
                  </button>
                )}
                <button
                  onClick={closeNotifications}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--gym-surface-subtle)', color: 'var(--gym-text-dim)' }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-3xl mb-2">🔕</p>
                  <p className="text-sm" style={{ color: 'var(--gym-text-muted)' }}>No notifications</p>
                </div>
              ) : (
                <motion.div layout>
                  {notifications.map(n => (
                    <NotifItem key={n.id} notif={n} />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2.5 text-center"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-[10px]" style={{ color: 'var(--gym-text-tertiary)' }}>
                {notifications.filter(n => n.read).length} read · {unreadCount} unread
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
