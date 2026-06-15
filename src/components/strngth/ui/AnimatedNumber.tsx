'use client';
import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export default function AnimatedNumber({ value, duration = 1200, format, className = '' }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start === end) return;

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (end - start) * easeOut(progress);
      setDisplay(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else { setDisplay(end); prevValue.current = end; }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  const formatted = format ? format(display) : Math.round(display).toLocaleString();
  return <span className={className}>{formatted}</span>;
}
