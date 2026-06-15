'use client';
import { useEffect, useRef } from 'react';

const CYAN = '#00d4ff';
const ITEM_H = 64;
const VISIBLE = 5;

/**
 * Vertical scroll wheel: numbers scroll under a fixed center card that
 * highlights the selected value (cyan border), with neighbours dimming out.
 * Snap-scrolling keeps a value centered.
 */
export default function WheelPicker({
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

  const containerH = ITEM_H * VISIBLE;
  const pad = (containerH - ITEM_H) / 2;
  const count = max - min + 1;

  // Keep the scroll position in sync with the value (mount + external changes).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = (value - min) * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 1) el.scrollTop = target;
  }, [value, min]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const idx = Math.round(el.scrollTop / ITEM_H);
      const v = Math.min(max, Math.max(min, min + idx));
      if (v !== value) onChange(v);
    });
  };

  return (
    <div className="relative mx-auto" style={{ height: containerH, width: 240 }}>
      {/* Fixed center highlight card */}
      <div
        className="absolute left-0 right-0 pointer-events-none rounded-2xl"
        style={{ top: pad, height: ITEM_H, border: `1.5px solid ${CYAN}`, boxShadow: `0 0 18px ${CYAN}33`, background: 'rgba(0,212,255,0.06)' }}
      />
      <div
        ref={ref}
        onScroll={onScroll}
        className="gym-wheel h-full overflow-y-auto"
        style={{
          scrollSnapType: 'y mandatory',
          maskImage: 'linear-gradient(180deg, transparent, #000 28%, #000 72%, transparent)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 28%, #000 72%, transparent)',
        }}
      >
        <div style={{ height: pad }} />
        {Array.from({ length: count }, (_, i) => {
          const n = min + i;
          const dist = Math.abs(n - value);
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.5 : dist === 2 ? 0.28 : 0.15;
          const selected = dist === 0;
          return (
            <div key={n} style={{ height: ITEM_H, scrollSnapAlign: 'center' }} className="flex items-center justify-center">
              <span
                className="font-black leading-none"
                style={{
                  opacity,
                  color: selected ? 'var(--gym-text)' : 'var(--gym-text-muted)',
                  fontSize: selected ? 34 : 24,
                  fontFamily: selected ? 'var(--gym-font-display-loaded, Orbitron, monospace)' : undefined,
                }}
              >
                {n}
              </span>
            </div>
          );
        })}
        <div style={{ height: pad }} />
      </div>
    </div>
  );
}
