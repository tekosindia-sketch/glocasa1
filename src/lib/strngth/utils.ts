import { Rank, RankConfig } from './types';

export const RANK_CONFIGS: RankConfig[] = [
  { rank: 'E', label: 'E Rank', color: '#6b7280', glow: 'rgba(107,114,128,0.4)', aura: '#6b7280', minXP: 0, maxXP: 5000, title: 'Novice Hunter' },
  { rank: 'D', label: 'D Rank', color: '#3b82f6', glow: 'rgba(59,130,246,0.4)', aura: '#3b82f6', minXP: 5000, maxXP: 15000, title: 'Apprentice Hunter' },
  { rank: 'C', label: 'C Rank', color: '#10b981', glow: 'rgba(16,185,129,0.4)', aura: '#10b981', minXP: 15000, maxXP: 35000, title: 'Skilled Hunter' },
  { rank: 'B', label: 'B Rank', color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)', aura: '#8b5cf6', minXP: 35000, maxXP: 65000, title: 'Elite Hunter' },
  { rank: 'A', label: 'A Rank', color: '#f59e0b', glow: 'rgba(245,158,11,0.5)', aura: '#f59e0b', minXP: 65000, maxXP: 110000, title: 'Shadow Elite' },
  { rank: 'S', label: 'S Rank', color: '#f97316', glow: 'rgba(249,115,22,0.5)', aura: '#f97316', minXP: 110000, maxXP: 175000, title: 'Sovereign Hunter' },
  { rank: 'SS', label: 'SS Rank', color: '#ef4444', glow: 'rgba(239,68,68,0.5)', aura: '#ef4444', minXP: 175000, maxXP: 260000, title: 'Monarch' },
  { rank: 'SSS', label: 'SSS Rank', color: '#ec4899', glow: 'rgba(236,72,153,0.6)', aura: 'linear-gradient(135deg,#ec4899,#8b5cf6,#00d4ff)', minXP: 260000, maxXP: Infinity, title: 'Shadow Sovereign' },
];

export function getRankConfig(rank: Rank): RankConfig {
  return RANK_CONFIGS.find(r => r.rank === rank) ?? RANK_CONFIGS[0];
}

export function getRankFromXP(totalXP: number): Rank {
  for (let i = RANK_CONFIGS.length - 1; i >= 0; i--) {
    if (totalXP >= RANK_CONFIGS[i].minXP) return RANK_CONFIGS[i].rank;
  }
  return 'E';
}

export function getLevelFromXP(totalXP: number): number {
  return Math.max(1, Math.floor(totalXP / 1500) + 1);
}

export function getXPProgress(totalXP: number): { current: number; max: number; percent: number } {
  const rank = getRankFromXP(totalXP);
  const config = getRankConfig(rank);
  const current = totalXP - config.minXP;
  const max = config.maxXP === Infinity ? config.minXP + 100000 : config.maxXP - config.minXP;
  return { current, max, percent: Math.min(100, (current / max) * 100) };
}

export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
}

export function calcWorkoutXP(sets: number, avgReps: number, avgWeight: number): number {
  const base = sets * 30;
  const volumeBonus = Math.floor((sets * avgReps * avgWeight) / 500);
  return base + volumeBonus;
}

export function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const RANK_ORDER: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];

export function isRankHigher(a: Rank, b: Rank): boolean {
  return RANK_ORDER.indexOf(a) > RANK_ORDER.indexOf(b);
}
