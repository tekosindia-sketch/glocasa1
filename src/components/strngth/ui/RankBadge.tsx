'use client';
import { Rank } from '@/lib/strngth/types';
import { getRankConfig } from '@/lib/strngth/utils';

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

const SIZES = {
  sm: { badge: 'w-8 h-8 text-[10px]', label: 'text-[10px]', pad: 'gap-1.5' },
  md: { badge: 'w-10 h-10 text-xs', label: 'text-xs', pad: 'gap-2' },
  lg: { badge: 'w-14 h-14 text-sm', label: 'text-sm', pad: 'gap-2' },
  xl: { badge: 'w-20 h-20 text-lg', label: 'text-base', pad: 'gap-3' },
};

export default function RankBadge({ rank, size = 'md', showLabel = false }: RankBadgeProps) {
  const cfg = getRankConfig(rank);
  const sz = SIZES[size];

  return (
    <div className={`inline-flex items-center ${sz.pad}`}>
      <div
        className={`gym-rank-badge ${sz.badge} font-black relative`}
        style={{ color: cfg.color, boxShadow: `0 0 12px ${cfg.glow}, 0 0 24px ${cfg.glow.replace('0.4', '0.15')}` }}>
        {rank}
      </div>
      {showLabel && (
        <div>
          <div className={`font-bold ${sz.label}`} style={{ color: cfg.color, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
            {cfg.label}
          </div>
          {size !== 'sm' && (
            <div className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>{cfg.title}</div>
          )}
        </div>
      )}
    </div>
  );
}
