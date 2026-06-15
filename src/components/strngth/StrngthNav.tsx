'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Dumbbell, Shield, User, Zap, Trophy } from 'lucide-react';
import { useStrngthStore } from '@/lib/strngth/store';
import { getRankConfig } from '@/lib/strngth/utils';

const NAV_ITEMS = [
  { href: '/strngth', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/strngth/workout', icon: Dumbbell, label: 'Workout' },
  { href: '/strngth/quests', icon: Shield, label: 'Quests' },
  { href: '/strngth/profile', icon: User, label: 'Profile' },
];

export default function StrngthNav() {
  const pathname = usePathname();
  const { player } = useStrngthStore();
  const rankCfg = getRankConfig(player.rank);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 z-40"
        style={{ background: 'var(--gym-nav-bg)', borderRight: '1px solid var(--gym-border)' }}>

        {/* Logo */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(0,212,255,0.3)' }}>
              <Zap size={18} style={{ color: '#00d4ff' }} />
            </div>
            <span className="text-xl font-black tracking-widest" style={{ fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', color: 'var(--gym-text)' }}>
              GYM<span style={{ color: '#00d4ff' }}>IFY</span>
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = href === '/strngth' ? pathname === '/strngth' : pathname.startsWith(href);
            return (
              <Link key={href} href={href}>
                <motion.div
                  className={`gym-nav-item flex items-center gap-3 px-4 py-3 cursor-pointer ${isActive ? 'active' : ''}`}
                  whileHover={{ x: 2 }}
                  transition={{ type: 'spring', stiffness: 500 }}>
                  <Icon size={18} style={{ color: isActive ? 'var(--gym-cyan)' : 'var(--gym-text-secondary)' }} />
                  <span className="text-sm font-medium" style={{ color: isActive ? 'var(--gym-text)' : 'var(--gym-text-secondary)' }}>
                    {label}
                  </span>
                  {isActive && (
                    <motion.div layoutId="nav-dot" className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }} />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Player card at bottom */}
        <div className="px-4 pb-6">
          <Link href="/strngth/profile">
            <motion.div className="gym-glass rounded-xl p-3 cursor-pointer" whileHover={{ scale: 1.01 }}>
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ background: `${rankCfg.color}22`, border: `1.5px solid ${rankCfg.color}`, color: rankCfg.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                    {player.avatarInitials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded flex items-center justify-center text-[9px] font-black"
                    style={{ background: rankCfg.color, color: '#030305', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                    {player.rank}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--gym-text)' }}>{player.username}</p>
                  <p className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>Lv.{player.level} · {rankCfg.title}</p>
                </div>
                <Trophy size={14} style={{ color: rankCfg.color, flexShrink: 0 }} />
              </div>
            </motion.div>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{ background: 'var(--gym-nav-bg)', borderTop: '1px solid var(--gym-border)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = href === '/strngth' ? pathname === '/strngth' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className="flex-1">
                <motion.div
                  className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg relative"
                  whileTap={{ scale: 0.92 }}>
                  {isActive && (
                    <motion.div layoutId="mobile-nav-bg" className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(0,212,255,0.08)' }} />
                  )}
                  <Icon size={20} style={{ color: isActive ? 'var(--gym-cyan)' : 'var(--gym-text-muted)', position: 'relative' }} />
                  <span className="text-[10px] font-medium relative" style={{ color: isActive ? 'var(--gym-cyan)' : 'var(--gym-text-muted)' }}>{label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
