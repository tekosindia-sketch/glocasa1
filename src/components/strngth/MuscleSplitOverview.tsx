'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useStrngthStore } from '@/lib/strngth/store';
import { computeSplits, SPLIT_MUSCLES } from '@/lib/strngth/muscleSplits';

type Range = 'weekly' | 'monthly';

const VIEW = 360;          // svg viewBox size
const CX = 180, CY = 180;  // center
const R = 96;              // radar radius
const ICON_R = 142;        // figure distance from center
const RINGS = 4;

export default function MuscleSplitOverview() {
  const { workoutHistory } = useStrngthStore();
  const [range, setRange] = useState<Range>('weekly');

  const days = range === 'weekly' ? 7 : 30;
  const sets = useMemo(() => computeSplits(workoutHistory, days), [workoutHistory, days]);

  const values = SPLIT_MUSCLES.map(m => sets[m.key]);
  const maxVal = Math.max(...values, 4); // keep a sensible minimum scale
  const n = SPLIT_MUSCLES.length;

  // angle for axis i (start at top, clockwise)
  const angleAt = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180);
  const pointAt = (i: number, radius: number) => ({
    x: CX + Math.cos(angleAt(i)) * radius,
    y: CY + Math.sin(angleAt(i)) * radius,
  });

  // data polygon points
  const dataPoints = SPLIT_MUSCLES.map((_, i) => {
    const ratio = maxVal > 0 ? values[i] / maxVal : 0;
    return pointAt(i, ratio * R);
  });
  const polygonStr = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="rounded-2xl overflow-hidden relative"
      style={{ background: 'var(--gym-surface-card)', border: '1px solid var(--gym-border)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <h2 className="text-sm font-black tracking-widest"
          style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
          MUSCLE SPLIT OVERVIEW
        </h2>
        {/* Weekly / Monthly toggle */}
        <div className="flex rounded-lg overflow-hidden flex-shrink-0"
          style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}>
          {(['weekly', 'monthly'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: range === r ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: range === r ? 'var(--gym-cyan)' : 'var(--gym-text-muted)',
                borderRight: r === 'weekly' ? '1px solid var(--gym-border)' : 'none',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Radar */}
      <div className="relative w-full px-2 pb-2">
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="w-full h-auto" style={{ maxHeight: 380 }}>
          {/* grid rings */}
          {Array.from({ length: RINGS }, (_, ring) => {
            const rr = (R / RINGS) * (ring + 1);
            const pts = SPLIT_MUSCLES.map((_, i) => {
              const p = pointAt(i, rr);
              return `${p.x},${p.y}`;
            }).join(' ');
            return (
              <polygon key={ring} points={pts}
                fill="none" stroke="var(--gym-border)" strokeWidth="1" />
            );
          })}

          {/* axes */}
          {SPLIT_MUSCLES.map((m, i) => {
            const end = pointAt(i, R);
            return (
              <line key={m.key} x1={CX} y1={CY} x2={end.x} y2={end.y}
                stroke="var(--gym-border)" strokeWidth="1" />
            );
          })}

          {/* ring scale labels along the top-right axis */}
          {Array.from({ length: RINGS }, (_, ring) => {
            const val = Math.round((maxVal / RINGS) * (ring + 1));
            const p = pointAt(0, (R / RINGS) * (ring + 1));
            return (
              <text key={`lbl-${ring}`} x={p.x + 8} y={p.y + 3}
                fontSize="9" fontWeight="700" textAnchor="middle"
                fill="var(--gym-text-muted)" fontFamily="Orbitron, monospace">
                {val}
              </text>
            );
          })}

          {/* data polygon */}
          <motion.polygon
            points={polygonStr}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            fill="rgba(0,212,255,0.28)"
            stroke="#00d4ff"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* data vertices */}
          {dataPoints.map((p, i) => (
            values[i] > 0 && (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill="#00d4ff"
                stroke="var(--gym-surface-card)" strokeWidth="1.5" />
            )
          ))}
        </svg>

        {/* Muscle figures positioned around the radar */}
        {SPLIT_MUSCLES.map((m, i) => {
          const p = pointAt(i, ICON_R);
          const leftPct = (p.x / VIEW) * 100;
          const topPct = (p.y / VIEW) * 100;
          const active = values[i] > 0;
          return (
            <div
              key={m.key}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${leftPct}%`, top: `${topPct}%`, width: 44 }}
            >
              <div className="flex items-center justify-center"
                style={{ width: 36, height: 46, opacity: 1 }}>
                <Image src={m.img} alt={m.name} width={36} height={46}
                  className="object-contain w-full h-full"
                  priority={i === 0}
                  style={{ filter: `drop-shadow(0 0 5px ${m.color}66)` }} />
              </div>
              <span className="text-[9px] font-black leading-none text-center"
                style={{ color: active ? m.color : 'var(--gym-text-muted)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                {sets[m.key]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend footer */}
      <div className="px-5 pb-4 pt-1">
        <p className="text-[9px] text-center" style={{ color: 'var(--gym-text-muted)' }}>
          {range === 'weekly' ? 'Last 7 days' : 'Last 30 days'} · sets trained per muscle group
        </p>
      </div>
    </div>
  );
}
