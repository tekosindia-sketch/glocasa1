'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlarmClock, Trash2, Plus, Check, ChevronRight, Bookmark, Info } from 'lucide-react';
import { useStrngthStore } from '@/lib/strngth/store';
import { MUSCLE_IMAGES, MUSCLE_GROUPS, ALL_EXERCISES, MuscleGroup } from '@/lib/strngth/exercises';

// ─── Anatomy image: canvas pixel pass removes dark spots & black bg ───────────

function AnatomyImage({ src, alt }: { src: string; alt: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src || typeof window === 'undefined') return;
    let cancelled = false;

    const imgEl = new window.Image();
    imgEl.onload = () => {
      if (cancelled) return;

      const canvas = document.createElement('canvas');
      canvas.width = imgEl.naturalWidth;
      canvas.height = imgEl.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(imgEl, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      const FADE_END = 58; // luminance threshold — below this, pixels fade out

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const lum = (r * 299 + g * 587 + b * 114) / 1000;

        if (lum < 5) {
          d[i + 3] = 0; // pure black bg → fully transparent
        } else if (lum < FADE_END) {
          // Dark spots → smooth alpha fade (0 at lum=5, 255 at lum=FADE_END)
          d[i + 3] = Math.round(((lum - 5) / (FADE_END - 5)) * 255);
        }
        // lum >= FADE_END → alpha stays 255 (opaque): figure, red muscle, equipment
      }

      ctx.putImageData(imageData, 0, 0);
      if (!cancelled) setDataUrl(canvas.toDataURL('image/png'));
    };
    imgEl.src = src;
    return () => { cancelled = true; };
  }, [src]);

  if (!dataUrl) return null;

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={dataUrl}
      alt={alt}
      className="absolute inset-0 w-full h-full object-contain object-center"
      style={{ padding: '12px 20px 48px' }}
    />
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMuscleGroup(category: string): MuscleGroup {
  const cat = category.toLowerCase();
  return (
    MUSCLE_GROUPS.find(g => cat.includes(g.id) || cat.includes(g.name.toLowerCase())) ??
    MUSCLE_GROUPS[0]
  );
}

interface LocalSet {
  key: string;
  kg: number;
  reps: number;
  completed: boolean;
}

// ─── Swipeable Set Row ────────────────────────────────────────────────────────

function SetRow({
  set, index, prevKg, prevReps,
  onUpdate, onComplete, onDelete, accentColor,
}: {
  set: LocalSet; index: number;
  prevKg: number | null; prevReps: number | null;
  onUpdate: (key: string, field: 'kg' | 'reps', val: number) => void;
  onComplete: (key: string) => void;
  onDelete: (key: string) => void;
  accentColor: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* Delete zone */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center"
        animate={{ opacity: revealed ? 1 : 0 }}
        style={{ background: 'rgba(239,68,68,0.15)', pointerEvents: revealed ? 'auto' : 'none' }}
      >
        <motion.button
          onClick={() => onDelete(set.key)}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={15} style={{ color: '#ef4444' }} />
        </motion.button>
      </motion.div>

      {/* Draggable row */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.05}
        onDragEnd={(_, info) => setRevealed(info.offset.x < -50)}
        animate={{ x: revealed ? -80 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="relative flex items-center gap-0 py-3.5 px-4 cursor-grab active:cursor-grabbing"
        style={{
          background: set.completed ? `${accentColor}0c` : 'transparent',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
        onClick={() => { if (revealed) setRevealed(false); }}
      >
        {/* SET # */}
        <span className="w-8 text-center text-xs font-black flex-shrink-0"
          style={{ color: set.completed ? accentColor : 'var(--gym-text-muted)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
          {index + 1}
        </span>

        {/* PREVIOUS */}
        <span className="flex-1 text-center text-sm" style={{ color: 'var(--gym-text-tertiary)' }}>
          {prevKg != null && prevReps != null ? `${prevKg}×${prevReps}` : '—'}
        </span>

        {/* KG */}
        <div className="flex-1 flex items-center justify-center gap-1.5">
          <button onClick={e => { e.stopPropagation(); onUpdate(set.key, 'kg', Math.max(0, set.kg - 2.5)); }}
            className="w-6 h-6 rounded-lg text-[11px] flex items-center justify-center font-bold"
            style={{ background: 'rgba(255,255,255,0.09)', color: 'var(--gym-text-dim)' }}>−</button>
          <span className="w-10 text-center text-sm font-black"
            style={{ color: set.completed ? accentColor : 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
            {set.kg}
          </span>
          <button onClick={e => { e.stopPropagation(); onUpdate(set.key, 'kg', set.kg + 2.5); }}
            className="w-6 h-6 rounded-lg text-[11px] flex items-center justify-center font-bold"
            style={{ background: 'rgba(255,255,255,0.09)', color: 'var(--gym-text-dim)' }}>+</button>
        </div>

        {/* REPS */}
        <div className="flex-1 flex items-center justify-center gap-1.5">
          <button onClick={e => { e.stopPropagation(); onUpdate(set.key, 'reps', Math.max(1, set.reps - 1)); }}
            className="w-6 h-6 rounded-lg text-[11px] flex items-center justify-center font-bold"
            style={{ background: 'rgba(255,255,255,0.09)', color: 'var(--gym-text-dim)' }}>−</button>
          <span className="w-8 text-center text-sm font-black"
            style={{ color: set.completed ? accentColor : 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
            {set.reps}
          </span>
          <button onClick={e => { e.stopPropagation(); onUpdate(set.key, 'reps', set.reps + 1); }}
            className="w-6 h-6 rounded-lg text-[11px] flex items-center justify-center font-bold"
            style={{ background: 'rgba(255,255,255,0.09)', color: 'var(--gym-text-dim)' }}>+</button>
        </div>

        {/* Complete check */}
        <motion.button
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ml-1"
          style={{
            background: set.completed ? accentColor : 'transparent',
            border: `2px solid ${set.completed ? accentColor : 'rgba(255,255,255,0.18)'}`,
            boxShadow: set.completed ? `0 0 12px ${accentColor}60` : 'none',
          }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}
          onClick={e => { e.stopPropagation(); onComplete(set.key); }}
        >
          <Check size={14} style={{ color: set.completed ? '#000' : 'rgba(255,255,255,0.25)' }} strokeWidth={3} />
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { activeWorkout, workoutHistory, endWorkout } = useStrngthStore();

  const exercise = activeWorkout?.exercises.find(e => e.id === id);
  const mg = exercise ? getMuscleGroup(exercise.category) : MUSCLE_GROUPS[0];
  const libraryEx = ALL_EXERCISES.find(e => e.id === id);
  const img = libraryEx?.image ?? MUSCLE_IMAGES[mg.id];

  const [sets, setSets] = useState<LocalSet[]>(() => {
    if (!exercise) return [{ key: 'set-0', kg: 0, reps: 10, completed: false }];
    return exercise.sets.length > 0
      ? exercise.sets.map((s, i) => ({ key: `set-${i}`, kg: s.weight, reps: s.reps || exercise.targetReps, completed: s.completed }))
      : Array.from({ length: 3 }, (_, i) => ({ key: `set-${i}`, kg: 0, reps: exercise.targetReps, completed: false }));
  });

  const [notes, setNotes] = useState('');
  const [restTimerOn, setRestTimerOn] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const prevLog = workoutHistory
    .flatMap(h => h.exerciseLogs ?? [])
    .find(log => log.exerciseId === id && log.sets.length > 0);
  const prevKg: number | null = prevLog?.sets[0]?.kg ?? null;
  const prevReps: number | null = prevLog?.sets[0]?.reps ?? null;

  if (!exercise) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#0a0a14' }}>
        <div className="text-center">
          <p className="text-lg font-bold mb-4" style={{ color: 'var(--gym-text)' }}>No active workout</p>
          <button onClick={() => router.push('/strngth/workout')} className="text-sm" style={{ color: '#00d4ff' }}>
            Go to Workout →
          </button>
        </div>
      </div>
    );
  }

  const addSet = () => setSets(prev => [
    ...prev,
    { key: `set-${Date.now()}`, kg: prev.at(-1)?.kg ?? 0, reps: prev.at(-1)?.reps ?? 10, completed: false },
  ]);
  const deleteSet = (key: string) => setSets(prev => prev.filter(s => s.key !== key));
  const updateSet = (key: string, field: 'kg' | 'reps', val: number) =>
    setSets(prev => prev.map(s => s.key === key ? { ...s, [field]: val } : s));
  const completeSet = (key: string) =>
    setSets(prev => prev.map(s => s.key === key ? { ...s, completed: !s.completed } : s));

  const completedCount = sets.filter(s => s.completed).length;

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#08080f' }}>

      {/* ── Full-width hero image ── */}
      <div
        className="relative w-full flex-shrink-0"
        style={{ height: 320, background: '#06060c', overflow: 'hidden' }}
      >
        {/* Deep atmospheric glow — gives the figure a halo */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 70% 85% at 58% 48%, ${mg.color}35 0%, ${mg.color}10 45%, transparent 72%)` }} />

        {/* Secondary ambient fill so the figure doesn't float on pure black */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 50% 60% at 40% 60%, rgba(20,12,6,0.6), transparent 65%)` }} />

        {img
          ? <AnatomyImage src={img} alt={exercise.name} />
          : <div className="absolute inset-0" style={{ background: `${mg.color}18` }} />
        }

        {/* Subtle muscle-color glow centered on the figure */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 45% 55% at 58% 42%, ${mg.color}12, transparent 60%)` }} />

        {/* Top fade — keeps nav buttons readable */}
        <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(6,6,12,0.72) 0%, rgba(6,6,12,0.3) 50%, transparent 100%)' }} />
        {/* Bottom fade — blends into page body */}
        <div className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #08080f 0%, rgba(8,8,15,0.85) 40%, transparent 100%)' }} />
        {/* Side vignettes — prevent figure from touching screen edges */}
        <div className="absolute inset-y-0 left-0 w-8 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(6,6,12,0.6), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-8 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(6,6,12,0.6), transparent)' }} />

        {/* Accent bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px]"
          style={{ background: `linear-gradient(90deg, transparent, ${mg.color}88, ${mg.color}, ${mg.color}44, transparent)` }} />

        {/* ── Top bar (floating over image) ── */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
          <motion.button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={17} style={{ color: '#fff' }} />
          </motion.button>

          <div className="flex items-center gap-2">
            {/* Bookmark */}
            <motion.button
              onClick={() => setBookmarked(b => !b)}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}
              whileTap={{ scale: 0.9 }}
            >
              <Bookmark size={16} style={{ color: bookmarked ? mg.color : '#fff', fill: bookmarked ? mg.color : 'none' }} />
            </motion.button>

            {/* Rest timer toggle */}
            <motion.button
              onClick={() => setRestTimerOn(t => !t)}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: restTimerOn ? `${mg.color}33` : 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${restTimerOn ? mg.color + '55' : 'rgba(255,255,255,0.12)'}`,
              }}
              whileTap={{ scale: 0.9 }}
            >
              <AlarmClock size={16} style={{ color: restTimerOn ? mg.color : '#fff' }} />
            </motion.button>

            {/* Finish button */}
            <motion.button
              className="px-4 py-2 rounded-full font-black text-xs"
              style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                border: `1.5px solid ${mg.color}88`,
                color: mg.color,
                fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                letterSpacing: '0.08em',
                boxShadow: `0 0 12px ${mg.color}30`,
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { endWorkout(); router.push('/strngth/workout'); }}
            >
              FINISH
            </motion.button>
          </div>
        </div>

        {/* ── Exercise name overlaid at bottom of image ── */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest"
                  style={{
                    background: `${mg.color}25`,
                    color: mg.color,
                    border: `1px solid ${mg.color}50`,
                    fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                  }}
                >
                  {mg.name.toUpperCase()}
                </span>
                {completedCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.35)' }}>
                    {completedCount}/{sets.length} done
                  </span>
                )}
              </div>
              <h1
                className="text-2xl font-black leading-tight"
                style={{ color: '#f5f5ff', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
              >
                {exercise.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 flex flex-col overflow-y-auto">

        {/* ── Notes bar ── */}
        <div className="px-4 pt-4 pb-2">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes for this exercise…"
              rows={2}
              className="w-full bg-transparent px-4 pt-3 pb-2 text-sm resize-none outline-none"
              style={{ color: 'rgba(255,255,255,0.7)', caretColor: mg.color, lineHeight: 1.5 }}
            />
          </div>
        </div>

        {/* ── Sets table ── */}
        <div className="px-4 pb-4 flex-1">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.08)`, boxShadow: `0 0 0 1px ${mg.color}0a` }}>

            {/* Table header */}
            <div
              className="grid px-4 py-3 text-[10px] font-black tracking-widest"
              style={{
                gridTemplateColumns: '2rem 1fr 1fr 1fr 2.5rem',
                color: 'var(--gym-text-muted)',
                borderBottom: `1px solid rgba(255,255,255,0.07)`,
                background: `${mg.color}06`,
              }}
            >
              <span className="text-center">SET</span>
              <span className="text-center">PREV</span>
              <span className="text-center">KG</span>
              <span className="text-center">REPS</span>
              <span />
            </div>

            {/* Set rows */}
            <AnimatePresence initial={false}>
              {sets.map((set, i) => (
                <motion.div
                  key={set.key}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <SetRow
                    set={set} index={i}
                    prevKg={prevKg} prevReps={prevReps}
                    onUpdate={updateSet} onComplete={completeSet} onDelete={deleteSet}
                    accentColor={mg.color}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* + Add set */}
            <motion.button
              className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: mg.color }}
              whileHover={{ background: `${mg.color}08` }}
              whileTap={{ scale: 0.98 }}
              onClick={addSet}
            >
              <Plus size={14} />
              Add set
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="flex gap-3 px-4 py-4 flex-shrink-0"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(8,8,15,0.97)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <motion.button
          className="flex-1 py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2"
          style={{
            background: `${mg.color}14`,
            border: `1.5px solid ${mg.color}44`,
            color: mg.color,
            fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
            letterSpacing: '0.06em',
            boxShadow: `0 0 16px ${mg.color}14`,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/strngth/workout/add-exercises')}
        >
          <Plus size={14} />
          ADD EXERCISES
        </motion.button>

        <motion.button
          className="px-5 py-3.5 rounded-2xl text-xs font-black flex items-center gap-1"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            color: 'var(--gym-text-muted)',
            fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          MORE
          <ChevronRight size={13} />
        </motion.button>
      </div>
    </div>
  );
}
