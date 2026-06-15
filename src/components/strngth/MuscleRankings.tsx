'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStrngthStore } from '@/lib/strngth/store';
import { computeMuscleRankings, getMuscleStyle, MuscleData, MuscleKey } from '@/lib/strngth/muscleRankings';

// ─── SVG path data ──────────────────────────────────────────────────────────

const BODY_SILHOUETTE = {
  head: { cx: 80, cy: 24, r: 19 },
  front: 'M 72 42 C 62 42 42 58 38 82 C 34 104 32 134 36 170 C 38 188 44 205 46 220 C 46 230 46 238 46 252 L 46 384 L 62 384 L 62 335 C 67 322 74 318 80 318 C 86 318 93 322 98 335 L 98 384 L 114 384 L 114 252 C 114 238 114 230 114 220 C 116 205 122 188 124 170 C 128 134 126 104 122 82 C 118 58 98 42 88 42 Z',
  back: 'M 72 42 C 62 42 42 58 38 82 C 34 104 32 134 36 170 C 38 188 44 205 46 220 C 46 230 46 238 46 252 L 46 384 L 62 384 L 62 335 C 67 322 74 318 80 318 C 86 318 93 322 98 335 L 98 384 L 114 384 L 114 252 C 114 238 114 230 114 220 C 116 205 122 188 124 170 C 128 134 126 104 122 82 C 118 58 98 42 88 42 Z',
};

type MusclePath = { muscleKey: MuscleKey; d: string };

const FRONT_PATHS: MusclePath[] = [
  // Shoulders
  { muscleKey: 'shoulders', d: 'M 38 68 C 28 71 24 88 28 107 C 31 117 43 122 53 117 C 55 106 56 93 54 83 C 52 73 46 63 38 68 Z' },
  { muscleKey: 'shoulders', d: 'M 122 68 C 132 71 136 88 132 107 C 129 117 117 122 107 117 C 105 106 104 93 106 83 C 108 73 114 63 122 68 Z' },
  // Chest
  { muscleKey: 'chest', d: 'M 57 75 C 48 77 44 91 47 105 C 49 115 57 120 66 118 C 74 116 80 108 80 98 C 80 83 70 71 57 75 Z' },
  { muscleKey: 'chest', d: 'M 103 75 C 112 77 116 91 113 105 C 111 115 103 120 94 118 C 86 116 80 108 80 98 C 80 83 90 71 103 75 Z' },
  // Biceps
  { muscleKey: 'biceps', d: 'M 29 109 C 23 121 21 152 27 167 C 31 175 43 175 49 165 C 53 155 52 126 47 112 C 43 104 35 102 29 109 Z' },
  { muscleKey: 'biceps', d: 'M 131 109 C 137 121 139 152 133 167 C 129 175 117 175 111 165 C 107 155 108 126 113 112 C 117 104 125 102 131 109 Z' },
  // Abs
  { muscleKey: 'abs', d: 'M 63 121 C 63 119 80 117 97 121 C 101 134 101 167 98 215 C 88 219 72 219 62 215 C 59 167 59 134 63 121 Z' },
  // Quads
  { muscleKey: 'quads', d: 'M 50 225 C 44 233 41 268 46 302 C 49 322 62 332 72 328 C 82 324 84 310 82 289 C 80 261 75 233 65 222 C 59 217 54 219 50 225 Z' },
  { muscleKey: 'quads', d: 'M 110 225 C 116 233 119 268 114 302 C 111 322 98 332 88 328 C 78 324 76 310 78 289 C 80 261 85 233 95 222 C 101 217 106 219 110 225 Z' },
  // Calves
  { muscleKey: 'calves', d: 'M 50 340 C 45 348 44 369 50 383 C 53 391 65 393 71 385 C 77 377 75 356 70 342 C 67 334 54 332 50 340 Z' },
  { muscleKey: 'calves', d: 'M 110 340 C 115 348 116 369 110 383 C 107 391 95 393 89 385 C 83 377 85 356 90 342 C 93 334 106 332 110 340 Z' },
];

const BACK_PATHS: MusclePath[] = [
  // Shoulders (rear)
  { muscleKey: 'shoulders', d: 'M 38 68 C 28 71 24 88 28 107 C 31 117 43 122 53 117 C 55 106 56 93 54 83 C 52 73 46 63 38 68 Z' },
  { muscleKey: 'shoulders', d: 'M 122 68 C 132 71 136 88 132 107 C 129 117 117 122 107 117 C 105 106 104 93 106 83 C 108 73 114 63 122 68 Z' },
  // Back (lats + traps) — large central shape, rendered first
  { muscleKey: 'back', d: 'M 54 74 C 46 82 40 106 42 136 C 42 164 52 183 62 193 C 68 197 80 198 80 198 C 80 198 92 197 98 193 C 108 183 118 164 118 136 C 120 106 114 82 106 74 C 98 66 62 66 54 74 Z' },
  // Triceps
  { muscleKey: 'triceps', d: 'M 29 109 C 23 121 21 152 27 167 C 31 175 43 175 49 165 C 53 155 52 126 47 112 C 43 104 35 102 29 109 Z' },
  { muscleKey: 'triceps', d: 'M 131 109 C 137 121 139 152 133 167 C 129 175 117 175 111 165 C 107 155 108 126 113 112 C 117 104 125 102 131 109 Z' },
  // Glutes
  { muscleKey: 'glutes', d: 'M 44 202 C 38 211 36 235 42 251 C 46 261 59 265 69 259 C 79 253 80 241 80 227 C 80 211 72 201 60 199 C 54 198 48 200 44 202 Z' },
  { muscleKey: 'glutes', d: 'M 116 202 C 122 211 124 235 118 251 C 114 261 101 265 91 259 C 81 253 80 241 80 227 C 80 211 88 201 100 199 C 106 198 112 200 116 202 Z' },
  // Hamstrings
  { muscleKey: 'hamstrings', d: 'M 44 265 C 38 273 36 305 42 329 C 46 343 59 351 69 345 C 79 339 80 325 78 303 C 76 275 70 261 60 257 C 54 255 48 259 44 265 Z' },
  { muscleKey: 'hamstrings', d: 'M 116 265 C 122 273 124 305 118 329 C 114 343 101 351 91 345 C 81 339 80 325 82 303 C 84 275 90 261 100 257 C 106 255 112 259 116 265 Z' },
  // Calves
  { muscleKey: 'calves', d: 'M 50 340 C 45 348 44 369 50 383 C 53 391 65 393 71 385 C 77 377 75 356 70 342 C 67 334 54 332 50 340 Z' },
  { muscleKey: 'calves', d: 'M 110 340 C 115 348 116 369 110 383 C 107 391 95 393 89 385 C 83 377 85 356 90 342 C 93 334 106 332 110 340 Z' },
];

// ─── Body SVG ────────────────────────────────────────────────────────────────

function BodySVG({ paths, muscleMap, onHover, hoveredMuscle }: {
  paths: MusclePath[];
  muscleMap: Map<MuscleKey, MuscleData>;
  onHover: (key: MuscleKey | null) => void;
  hoveredMuscle: MuscleKey | null;
}) {
  return (
    <svg viewBox="0 0 160 400" className="w-full h-full" style={{ maxHeight: '380px' }}>
      {/* Body silhouette */}
      <circle cx={BODY_SILHOUETTE.head.cx} cy={BODY_SILHOUETTE.head.cy} r={BODY_SILHOUETTE.head.r}
        fill="var(--gym-surface-hover)" stroke="var(--gym-border)" strokeWidth="1" />
      <path d={BODY_SILHOUETTE.front}
        fill="var(--gym-surface-hover)" stroke="var(--gym-border)" strokeWidth="1" />

      {/* Muscle paths */}
      {paths.map((mp, i) => {
        const data = muscleMap.get(mp.muscleKey);
        const { fill, fillOpacity } = getMuscleStyle(data);
        const isHovered = hoveredMuscle === mp.muscleKey;
        return (
          <motion.path
            key={`${mp.muscleKey}-${i}`}
            d={mp.d}
            fill={fill}
            stroke={isHovered ? fill : 'transparent'}
            strokeWidth={isHovered ? 1.5 : 0}
            initial={{ fillOpacity: 0 }}
            animate={{
              fillOpacity: isHovered ? Math.min(fillOpacity + 0.2, 1) : fillOpacity,
              scale: isHovered ? 1.02 : 1,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ cursor: 'pointer', transformOrigin: 'center', transformBox: 'fill-box' }}
            onMouseEnter={() => onHover(mp.muscleKey)}
            onMouseLeave={() => onHover(null)}
          />
        );
      })}
    </svg>
  );
}

// ─── Intensity label ─────────────────────────────────────────────────────────

function IntensityPill({ intensity }: { intensity: MuscleData['intensity'] }) {
  const cfg = {
    none:   { label: 'Rest',   bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
    low:    { label: 'Low',    bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
    medium: { label: 'Mid',    bg: 'rgba(34,197,94,0.12)',   color: '#22c55e' },
    high:   { label: 'Peak',   bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
  }[intensity];
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MuscleRankings() {
  const { workoutHistory } = useStrngthStore();
  const [view, setView] = useState<'front' | 'back'>('front');
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleKey | null>(null);

  const rankings = useMemo(() => computeMuscleRankings(workoutHistory), [workoutHistory]);

  const muscleMap = useMemo(() => {
    const m = new Map<MuscleKey, MuscleData>();
    rankings.forEach(r => m.set(r.key, r));
    return m;
  }, [rankings]);

  const hovered = hoveredMuscle ? muscleMap.get(hoveredMuscle) : null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--gym-surface-card)', border: '1px solid var(--gym-border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
            💪
          </div>
          <div>
            <h2 className="text-xs font-black tracking-widest" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
              MUSCLE RANKINGS
            </h2>
            <p className="text-[9px]" style={{ color: 'var(--gym-text-muted)' }}>Last 30 days training volume</p>
          </div>
        </div>

        {/* Front / Back toggle */}
        <div className="flex rounded-lg overflow-hidden" style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}>
          {(['front', 'back'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: view === v ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: view === v ? 'var(--gym-cyan)' : 'var(--gym-text-muted)',
                borderRight: v === 'front' ? '1px solid var(--gym-border)' : 'none',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-0">
        {/* Body map */}
        <div className="relative flex items-center justify-center px-4 pb-4 sm:w-52 sm:flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: view === 'front' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: view === 'front' ? 10 : -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
              style={{ maxWidth: '160px' }}
            >
              <BodySVG
                paths={view === 'front' ? FRONT_PATHS : BACK_PATHS}
                muscleMap={muscleMap}
                onHover={setHoveredMuscle}
                hoveredMuscle={hoveredMuscle}
              />
            </motion.div>
          </AnimatePresence>

          {/* Hover tooltip */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap pointer-events-none"
                style={{ background: hovered.color + 'ee', color: '#fff', boxShadow: `0 4px 16px ${hovered.color}50` }}
              >
                {hovered.name} · {Math.round(hovered.normalizedScore * 100)}%
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rankings list */}
        <div className="flex-1 px-4 pb-5 sm:pl-0 sm:pr-5 sm:pt-2">
          <div className="space-y-2.5">
            {rankings.map((muscle, idx) => {
              const pct = Math.round(muscle.normalizedScore * 100);
              const isHov = hoveredMuscle === muscle.key;
              return (
                <motion.div
                  key={muscle.key}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredMuscle(muscle.key)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black w-4 text-center" style={{ color: 'var(--gym-text-muted)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                        {idx + 1}
                      </span>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                        background: muscle.normalizedScore > 0 ? muscle.color : '#94a3b8',
                        boxShadow: muscle.normalizedScore > 0 ? `0 0 6px ${muscle.color}80` : 'none',
                      }} />
                      <span className="text-xs font-bold" style={{ color: isHov ? muscle.color : 'var(--gym-text)' }}>
                        {muscle.name}
                      </span>
                      <IntensityPill intensity={muscle.intensity} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: 'var(--gym-text-muted)' }}>
                        {muscle.setsCompleted}s
                      </span>
                      <span className="text-[10px] font-bold w-8 text-right" style={{
                        color: muscle.normalizedScore > 0 ? muscle.color : 'var(--gym-text-muted)',
                        fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                      }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full overflow-hidden ml-6" style={{ background: 'var(--gym-surface-hover)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.04 }}
                      style={{
                        background: muscle.normalizedScore > 0
                          ? `linear-gradient(90deg, ${muscle.color}99, ${muscle.color})`
                          : 'rgba(148,163,184,0.3)',
                        boxShadow: muscle.normalizedScore > 0.7 ? `0 0 8px ${muscle.color}60` : 'none',
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-[9px] mt-4 text-center" style={{ color: 'var(--gym-text-muted)' }}>
            Hover muscle map to highlight · Score = sets × reps × weight
          </p>
        </div>
      </div>
    </div>
  );
}
