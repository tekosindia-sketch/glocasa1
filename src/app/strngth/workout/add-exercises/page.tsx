'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bookmark, HelpCircle, Play, Search, Zap, X } from 'lucide-react';
import { useStrngthStore } from '@/lib/strngth/store';
import { MUSCLE_GROUPS, MUSCLE_IMAGES, ALL_EXERCISES, DIFF_COLORS, parseReps, FlatExercise } from '@/lib/strngth/exercises';

// ─── Exercise Card ────────────────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  selected,
  bookmarked,
  onToggle,
  onBookmark,
}: {
  exercise: FlatExercise;
  selected: boolean;
  bookmarked: boolean;
  onToggle: (id: string) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
}) {
  const { muscleGroup: mg } = exercise;
  const theme = useStrngthStore(s => s.theme);
  const baseImg = exercise.image ?? MUSCLE_IMAGES[mg.id];
  const img = baseImg && theme === 'light' ? baseImg.replace(/(-v2)?\.png$/, (_, v2) => `-light${v2 || ''}.png`) : baseImg;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => onToggle(exercise.id)}
      className="rounded-2xl overflow-hidden cursor-pointer relative flex flex-col"
      style={{
        background: 'var(--gym-surface-card)',
        border: `1.5px solid ${selected ? mg.color : 'rgba(255,255,255,0.08)'}`,
        boxShadow: selected ? `0 0 16px ${mg.color}40, inset 0 0 20px ${mg.color}08` : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Illustration area */}
      <div className="gym-ex-img-wrap relative h-40 overflow-hidden" style={{ background: theme === 'light' ? '#dde1ee' : 'rgba(5,5,15,0.9)' }}>
        {img ? (
          <Image
            src={img}
            alt={exercise.name}
            fill
            className="object-cover object-center"
            style={{ filter: selected ? `saturate(1.3) brightness(1.05)` : 'saturate(0.9) brightness(0.85)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `radial-gradient(circle at 50% 40%, ${mg.color}18, transparent 70%)` }}>
            <span className="text-4xl opacity-40">💪</span>
          </div>
        )}

        {/* Color gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16"
          style={{ background: `linear-gradient(to top, rgba(10,10,20,0.98), transparent)` }} />

        {/* Selected check */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: mg.color, color: '#000', boxShadow: `0 0 10px ${mg.color}` }}
            >
              ✓
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bookmark */}
        <motion.button
          className="absolute top-2.5 left-2.5 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => onBookmark(exercise.id, e)}
          whileTap={{ scale: 0.85 }}
        >
          <Bookmark
            size={13}
            style={{ color: bookmarked ? mg.color : 'var(--gym-text-dim)', fill: bookmarked ? mg.color : 'none' }}
          />
        </motion.button>

        {/* Question mark */}
        <button
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <HelpCircle size={13} style={{ color: 'var(--gym-text-dim)' }} />
        </button>

        {/* Muscle group color bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, ${mg.color}, ${mg.color}60)` }} />
      </div>

      {/* Info area */}
      <div className="px-3 py-2.5 flex-1">
        <p className="font-bold text-sm leading-tight mb-0.5" style={{ color: selected ? '#fff' : 'var(--gym-text)' }}>
          {exercise.name}
        </p>
        <p className="text-[11px]" style={{ color: mg.color }}>
          {mg.name}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ background: `${DIFF_COLORS[exercise.difficulty]}18`, color: DIFF_COLORS[exercise.difficulty] }}
          >
            {exercise.difficulty}
          </span>
          <div className="flex items-center gap-0.5">
            <Zap size={9} style={{ color: '#f59e0b' }} />
            <span className="text-[10px] font-bold" style={{ color: '#f59e0b', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
              +{exercise.xpPerSet}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AddExercisesPage() {
  const router = useRouter();
  const { startCustomWorkout, addExercisesToWorkout, activeWorkout } = useStrngthStore();
  const isAddingToExisting = !!activeWorkout;

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = activeFilter === 'all'
      ? ALL_EXERCISES
      : activeFilter === 'saved'
      ? ALL_EXERCISES.filter(e => bookmarked.has(e.id))
      : ALL_EXERCISES.filter(e => e.muscleGroup.id === activeFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) || e.muscleGroup.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeFilter, search, bookmarked]);

  const toggleSelect = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const totalXP = Array.from(selected).reduce((acc, id) => {
    const ex = ALL_EXERCISES.find(e => e.id === id);
    return acc + (ex ? ex.xpPerSet * ex.sets : 0);
  }, 0);

  const handleCreateWorkout = () => {
    const exercises = ALL_EXERCISES
      .filter(e => selected.has(e.id))
      .map(e => ({
        id: e.id,
        name: e.name,
        category: e.muscleGroup.name,
        targetSets: e.sets,
        targetReps: parseReps(e.reps),
        xpPerSet: e.xpPerSet,
      }));
    if (isAddingToExisting) {
      addExercisesToWorkout(exercises);
    } else {
      startCustomWorkout(exercises, 'Custom Workout');
    }
    router.push('/strngth/workout');
  };

  const filterTitle = activeFilter === 'all'
    ? 'All Exercises'
    : activeFilter === 'saved'
    ? 'Saved'
    : MUSCLE_GROUPS.find(g => g.id === activeFilter)?.name ?? 'Exercises';

  return (
    <div className="min-h-dvh pb-40" style={{ background: 'var(--gym-bg, #03030a)' }}>

      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(3,3,10,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <motion.button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-2)', color: 'var(--gym-text-dim)' }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        >
          <ArrowLeft size={16} />
        </motion.button>

        {/* Search */}
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gym-text-tertiary)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full h-9 pl-9 pr-8 rounded-xl text-sm outline-none"
            style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-2)', color: 'var(--gym-text)', caretColor: '#00d4ff' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={12} style={{ color: 'var(--gym-text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Filter strip */}
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}>
        {/* All tab */}
        <motion.button
          onClick={() => setActiveFilter('all')}
          className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: activeFilter === 'all' ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${activeFilter === 'all' ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: activeFilter === 'all' ? '0 0 12px rgba(0,212,255,0.3)' : 'none',
          }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        >
          <Bookmark size={16} style={{ color: activeFilter === 'all' ? '#00d4ff' : 'var(--gym-text-dim)' }} />
        </motion.button>

        {/* Saved tab */}
        <motion.button
          onClick={() => setActiveFilter('saved')}
          className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: activeFilter === 'saved' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${activeFilter === 'saved' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: activeFilter === 'saved' ? '0 0 12px rgba(245,158,11,0.3)' : 'none',
          }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        >
          <Bookmark size={16} style={{ color: activeFilter === 'saved' ? '#f59e0b' : 'var(--gym-text-dim)', fill: activeFilter === 'saved' ? '#f59e0b' : 'none' }} />
        </motion.button>

        {/* Muscle group tabs */}
        {MUSCLE_GROUPS.map(g => {
          const active = activeFilter === g.id;
          const img = MUSCLE_IMAGES[g.id];
          return (
            <motion.button
              key={g.id}
              onClick={() => setActiveFilter(active ? 'all' : g.id)}
              className="flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden relative"
              style={{
                border: `1.5px solid ${active ? g.color : 'rgba(255,255,255,0.1)'}`,
                boxShadow: active ? `0 0 12px ${g.color}50` : 'none',
              }}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            >
              {img ? (
                <Image src={img} alt={g.name} fill className="object-cover object-top"
                  style={{ opacity: active ? 1 : 0.5, filter: active ? 'none' : 'grayscale(0.4)' }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm"
                  style={{ background: `${g.color}18` }}>
                  💪
                </div>
              )}
              {active && (
                <div className="absolute inset-0 rounded-xl"
                  style={{ boxShadow: `inset 0 0 10px ${g.color}30`, background: `${g.color}08` }} />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Title row */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2
          className="text-lg font-black"
          style={{ color: '#00d4ff', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)', letterSpacing: '0.05em' }}
        >
          {filterTitle}
        </h2>
        <span className="text-xs" style={{ color: 'var(--gym-text-tertiary)' }}>
          {filtered.length} exercises
        </span>
      </div>

      {/* Exercise grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((ex, i) => (
            <motion.div
              key={ex.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <ExerciseCard
                exercise={ex}
                selected={selected.has(ex.id)}
                bookmarked={bookmarked.has(ex.id)}
                onToggle={toggleSelect}
                onBookmark={toggleBookmark}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-2 py-20 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm" style={{ color: 'var(--gym-text-muted)' }}>No exercises found</p>
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-20 left-0 right-0 px-4 z-30"
          >
            <motion.button
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))',
                border: '1.5px solid rgba(0,212,255,0.5)',
                color: 'var(--gym-text)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,212,255,0.2)',
                fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)',
                letterSpacing: '0.06em',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 40px rgba(0,212,255,0.35)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateWorkout}
            >
              <Play size={16} style={{ color: '#00d4ff' }} />
              {isAddingToExisting ? 'ADD TO WORKOUT' : 'START WORKOUT'}
              <span
                className="px-2 py-0.5 rounded-lg text-xs"
                style={{ background: 'rgba(0,212,255,0.2)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)' }}
              >
                {selected.size} ex · ~{totalXP} XP
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
