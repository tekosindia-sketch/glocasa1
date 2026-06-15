import { WorkoutHistory } from './types';
import { EXERCISE_LIBRARY } from './exercises';

export type SplitMuscle =
  | 'chest' | 'shoulders' | 'biceps' | 'forearms' | 'abs'
  | 'quads' | 'hamstrings' | 'calves' | 'back';

// Ordered clockwise from top — defines radar axis positions
export const SPLIT_MUSCLES: { key: SplitMuscle; name: string; color: string; img: string }[] = [
  { key: 'chest',      name: 'Chest',      color: '#ef4444', img: '/strngth/splits/chest.png' },
  { key: 'shoulders',  name: 'Shoulders',  color: '#06b6d4', img: '/strngth/splits/shoulders.png' },
  { key: 'biceps',     name: 'Biceps',     color: '#3b82f6', img: '/strngth/splits/biceps.png' },
  { key: 'forearms',   name: 'Forearms',   color: '#fb923c', img: '/strngth/splits/forearms.png' },
  { key: 'abs',        name: 'Abs',        color: '#10b981', img: '/strngth/splits/abs.png' },
  { key: 'quads',      name: 'Quads',      color: '#f59e0b', img: '/strngth/splits/quads.png' },
  { key: 'hamstrings', name: 'Hamstrings', color: '#e11d48', img: '/strngth/splits/hamstrings.png' },
  { key: 'calves',     name: 'Calves',     color: '#34d399', img: '/strngth/splits/calves.png' },
  { key: 'back',       name: 'Back',       color: '#f97316', img: '/strngth/splits/back.png' },
];

const LIBRARY_KEY_MAP: Record<string, SplitMuscle> = {
  chest: 'chest', biceps: 'biceps', back: 'back', shoulders: 'shoulders',
  abs: 'abs', quadriceps: 'quads', hamstrings: 'hamstrings',
  calves: 'calves', forearms: 'forearms',
};

const EXERCISE_TO_MUSCLE: Record<string, SplitMuscle> = {};
for (const [group, exercises] of Object.entries(EXERCISE_LIBRARY)) {
  const mk = LIBRARY_KEY_MAP[group];
  if (mk) exercises.forEach(ex => { EXERCISE_TO_MUSCLE[ex.id] = mk; });
}

export interface SplitData {
  key: SplitMuscle;
  sets: number;
}

/** Total sets per muscle group within the last `days` days. */
export function computeSplits(history: WorkoutHistory[], days: number): Record<SplitMuscle, number> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const sets = Object.fromEntries(SPLIT_MUSCLES.map(m => [m.key, 0])) as Record<SplitMuscle, number>;

  for (const wo of history) {
    if (new Date(wo.date).getTime() < cutoff) continue;
    for (const log of wo.exerciseLogs ?? []) {
      const mk = EXERCISE_TO_MUSCLE[log.exerciseId];
      if (mk) sets[mk] += log.sets.length;
    }
  }
  return sets;
}
