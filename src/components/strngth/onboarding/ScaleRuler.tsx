'use client';
import { useEffect, useRef } from 'react';

const CYAN = '#00d4ff';
const UNIT = 14; // px per unit

/**
 * Horizontal ruler with a fixed center needle: the numbered scale scrolls under
 * it and the centered value is highlighted cyan. Snap-scrolls to whole units.
 */
export default function ScaleRuler({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | undefined>(undefined);
  const count = max - min + 1;

  // Keep scroll position synced with value (mount + external changes).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = (value - min) * UNIT;
    if (Math.abs(el.scrollLeft - target) > 1) el.scrollLeft = target;
  }, [value, min]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const idx = Math.round(el.scrollLeft / UNIT);
      const v = Math.min(max, Math.max(min, min + idx));
      if (v !== value) onChange(v);
    });
  };

  return (
    <div className="relative w-full" style={{ height: 88 }}>
      {/* Fixed center needle */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-10"
        style={{ top: 20, bottom: 10, width: 2, background: CYAN, boxShadow: `0 0 8px ${CYAN}`, borderRadius: 2 }}
      />
      <div
        ref={ref}
        onScroll={onScroll}
        className="gym-wheel h-full overflow-x-auto flex items-stretch"
        style={{
          scrollSnapType: 'x mandatory',
          maskImage: 'linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)',
        }}
      >
        <div className="flex-shrink-0" style={{ minWidth: `calc(50% - ${UNIT / 2}px)` }} />
        {Array.from({ length: count }, (_, i) => {
          const n = min + i;
          const major = n % 5 === 0;
          const selected = n === value;
          return (
            <div key={n} className="flex-shrink-0 relative" style={{ width: UNIT, scrollSnapAlign: 'center' }}>
              {major && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-0 text-[11px] font-bold"
                  style={{ color: selected ? CYAN : 'var(--gym-text-tertiary)', whiteSpace: 'nowrap' }}
                >
                  {n}
                </span>
              )}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: 12,
                  width: major ? 2 : 1,
                  height: major ? 22 : 12,
                  background: selected ? CYAN : major ? 'var(--gym-text-muted)' : 'var(--gym-border-bright)',
                }}
              />
            </div>
          );
        })}
        <div className="flex-shrink-0" style={{ minWidth: `calc(50% - ${UNIT / 2}px)` }} />
      </div>
    </div>
  );
}
