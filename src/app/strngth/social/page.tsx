'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Heart, MessageCircle, Share2, Flame, Zap, Star } from 'lucide-react';
import { useStrngthStore } from '@/lib/strngth/store';
import { getRankConfig, formatXP, timeAgo } from '@/lib/strngth/utils';
import GlassCard from '@/components/strngth/ui/GlassCard';
import RankBadge from '@/components/strngth/ui/RankBadge';
import { Rank } from '@/lib/strngth/types';
import { MOCK_GUILDS } from '@/lib/strngth/data';

const FEED_TYPE_CONFIG = {
  workout: { icon: '⚔️', color: '#8b5cf6', label: 'completed a workout' },
  levelup: { icon: '⚡', color: '#00d4ff', label: 'leveled up' },
  pr: { icon: '🏆', color: '#f59e0b', label: 'set a new PR' },
  badge: { icon: '🛡️', color: '#10b981', label: 'unlocked a badge' },
  streak: { icon: '🔥', color: '#f97316', label: 'hit a streak' },
};

export default function SocialPage() {
  const { leaderboard, socialFeed, player, toggleLikeFeed } = useStrngthStore();
  const [tab, setTab] = useState<'feed' | 'leaderboard' | 'guilds'>('leaderboard');
  const rankCfg = getRankConfig(player.rank);

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-5xl mx-auto">

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--gym-text-muted)', letterSpacing: '0.15em' }}>HUNTER NETWORK</p>
        <h1 className="text-2xl font-black" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
          SOCIAL HUB
        </h1>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}>
        {(['leaderboard', 'feed', 'guilds'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 capitalize"
            style={{
              background: tab === t ? 'rgba(0,212,255,0.12)' : 'transparent',
              color: tab === t ? '#00d4ff' : 'var(--gym-text-secondary)',
              border: tab === t ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
              fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
              letterSpacing: '0.08em',
            }}>
            {t}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">

        {/* Leaderboard */}
        {tab === 'leaderboard' && (
          <motion.div key="leaderboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>

            {/* Top 3 podium */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
                if (!entry) return null;
                const eCfg = getRankConfig(entry.playerRank);
                const positions = [2, 1, 3];
                const heights = ['h-24', 'h-32', 'h-20'];
                const medals = ['🥈', '🥇', '🥉'];
                const zOrders = ['z-10', 'z-20', 'z-10'];
                return (
                  <motion.div key={entry.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex flex-col items-center ${zOrders[i]}`}>
                    <span className="text-2xl mb-2">{medals[i]}</span>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold mb-2"
                      style={{ background: `${eCfg.color}18`, border: `2px solid ${eCfg.color}`, color: eCfg.color, boxShadow: `0 0 12px ${eCfg.color}40`, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', fontSize: '0.9rem' }}>
                      {entry.username[0]}
                    </div>
                    <p className="text-[10px] font-semibold text-center mb-1 truncate w-full px-1" style={{ color: entry.isCurrentUser ? eCfg.color : 'var(--gym-text)' }}>
                      {entry.username}
                    </p>
                    <p className="text-[9px]" style={{ color: 'var(--gym-text-muted)' }}>{formatXP(entry.totalXP)} XP</p>
                    <div className={`w-full rounded-t-lg mt-2 ${heights[i]}`}
                      style={{ background: `linear-gradient(to top, ${eCfg.color}20, ${eCfg.color}08)`, border: `1px solid ${eCfg.color}25`, borderBottom: 'none' }}>
                      <div className="text-center pt-2">
                        <span className="font-black text-xl" style={{ color: eCfg.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>#{positions[i]}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Full leaderboard */}
            <GlassCard className="overflow-hidden" hover={false}>
              {leaderboard.map((entry, i) => {
                const eCfg = getRankConfig(entry.playerRank);
                return (
                  <motion.div key={entry.userId}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    className="flex items-center gap-3 px-4 py-3.5"
                    style={{
                      borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: entry.isCurrentUser ? `${eCfg.color}06` : 'transparent',
                    }}>

                    <span className="w-6 text-center text-sm font-black flex-shrink-0"
                      style={{ color: i < 3 ? eCfg.color : 'var(--gym-text-tertiary)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${entry.rank}`}
                    </span>

                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${eCfg.color}15`, border: `1.5px solid ${eCfg.color}40`, color: eCfg.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                      {entry.username.slice(0, 2)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: entry.isCurrentUser ? eCfg.color : 'var(--gym-text)' }}>
                          {entry.username}{entry.isCurrentUser ? ' (You)' : ''}
                        </p>
                        {entry.guild && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ background: 'var(--gym-surface-subtle)', color: 'var(--gym-text-muted)' }}>
                            {entry.guild}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>Lv.{entry.level}</p>
                        <span style={{ color: 'var(--gym-text-tertiary)' }}>·</span>
                        <Flame size={10} style={{ color: '#f97316' }} />
                        <p className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>{entry.streak}d</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: '#00d4ff', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                        {formatXP(entry.totalXP)}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--gym-text-tertiary)' }}>total XP</p>
                    </div>

                    <div className="flex-shrink-0">
                      <RankBadge rank={entry.playerRank as Rank} size="sm" />
                    </div>
                  </motion.div>
                );
              })}
            </GlassCard>
          </motion.div>
        )}

        {/* Social Feed */}
        {tab === 'feed' && (
          <motion.div key="feed" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="space-y-3">
            {socialFeed.map((item, i) => {
              const eCfg = getRankConfig(item.playerRank);
              const typeCfg = FEED_TYPE_CONFIG[item.type];
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--gym-border)' }}>

                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                        style={{ background: `${eCfg.color}18`, border: `1.5px solid ${eCfg.color}40`, color: eCfg.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                        {item.username[0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded flex items-center justify-center text-[10px] font-black"
                        style={{ background: eCfg.color, color: '#030305', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                        {item.playerRank}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-sm" style={{ color: 'var(--gym-text)' }}>{item.username}</span>
                        <span className="text-xs" style={{ color: typeCfg.color }}>{item.content}</span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: 'var(--gym-text-dim)' }}>{item.detail}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px]" style={{ color: 'var(--gym-text-tertiary)' }}>{timeAgo(item.timestamp)}</span>
                        {item.xpGained && (
                          <span className="text-[10px] font-bold" style={{ color: '#00d4ff', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                            +{item.xpGained} XP
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-2xl flex-shrink-0">{typeCfg.icon}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <motion.button className="flex items-center gap-1.5 text-xs"
                      style={{ color: item.liked ? '#ef4444' : 'var(--gym-text-muted)' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLikeFeed(item.id)}>
                      <Heart size={14} fill={item.liked ? '#ef4444' : 'none'} />
                      {item.likes}
                    </motion.button>
                    <button className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--gym-text-muted)' }}>
                      <MessageCircle size={14} />
                      Reply
                    </button>
                    <button className="flex items-center gap-1.5 text-xs ml-auto" style={{ color: 'var(--gym-text-muted)' }}>
                      <Share2 size={14} />
                      Share
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Guilds */}
        {tab === 'guilds' && (
          <motion.div key="guilds" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="space-y-3">

            {/* My Guild */}
            <div className="p-5 rounded-2xl mb-2" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.1em' }}>MY GUILD</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.4)', color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                  ⚔️
                </div>
                <div>
                  <p className="font-bold" style={{ color: 'var(--gym-text)' }}>Iron Legion</p>
                  <p className="text-xs" style={{ color: 'var(--gym-text-dim)' }}>48 members · Global Rank #3</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-black text-lg" style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>284.7K</p>
                  <p className="text-xs" style={{ color: 'var(--gym-text-muted)' }}>weekly XP</p>
                </div>
              </div>
            </div>

            {/* Guild rankings */}
            {MOCK_GUILDS.map((guild, i) => (
              <motion.div key={guild.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${guild.id === 'g1' ? guild.color + '30' : 'rgba(255,255,255,0.07)'}` }}
                whileHover={{ scale: 1.005 }}>

                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black w-8 text-center" style={{ color: i < 3 ? guild.color : 'var(--gym-text-tertiary)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                    #{guild.rank}
                  </span>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black"
                    style={{ background: `${guild.color}12`, border: `1.5px solid ${guild.color}35`, color: guild.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', fontSize: '0.65rem' }}>
                    [{guild.tag}]
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold" style={{ color: 'var(--gym-text)' }}>{guild.name}</p>
                      {guild.id === 'g1' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: `${guild.color}18`, color: guild.color, border: `1px solid ${guild.color}30` }}>
                          MEMBER
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--gym-text-secondary)' }}>{guild.description}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--gym-text-tertiary)' }}>{guild.members} members</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: guild.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                      {formatXP(guild.weeklyXP)}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--gym-text-tertiary)' }}>weekly XP</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
