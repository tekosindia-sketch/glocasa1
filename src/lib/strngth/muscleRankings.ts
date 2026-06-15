import { WorkoutHistory } from './types';
import { EXERCISE_LIBRARY } from './exercises';

export type MuscleKey =
  | 'chest' | 'shoulders' | 'biceps' | 'triceps' | 'abs'
  | 'back' | 'glutes' | 'quads' | 'hamstrings' | 'calves';

export interface MuscleData {
  key: MuscleKey;
  name: string;
  color: string;
  score: number;
  normalizedScore: number;
  setsCompleted: number;
  intensity: 'none' | 'low' | 'medium' | 'high';
}

export const MUSCLE_META: Record<MuscleKey, { name: string; color: string }> = {
  chest:      { name: 'Chest',      color: '#ef4444' },
  shoulders:  { name: 'Shoulders',  color: '#06b6d4' },
  biceps:     { name: 'Biceps',     color: '#3b82f6' },
  triceps:    { name: 'Triceps',    color: '#8b5cf6' },
  abs:        { name: 'Abs',        color: '#10b981' },
  back:       { name: 'Back',       color: '#f97316' },
  glutes:     { name: 'Glutes',     color: '#ec4899' },
  quads:      { name: 'Quads',      color: '#f59e0b' },
  hamstrings: { name: 'Hamstrings', color: '#e11d48' },
  calves:     { name: 'Calves',     color: '#34d399' },
};

const LIBRARY_KEY_MAP: Record<string, MuscleKey> = {
  chest: 'chest', biceps: 'biceps', triceps: 'triceps', back: 'back',
  shoulders: 'shoulders', abs: 'abs', quadriceps: 'quads',
  hamstrings: 'hamstrings', hips: 'glutes', calves: 'calves',
};

const EXERCISE_TO_MUSCLE: Record<string, MuscleKey> = {};
for (const [group, exercises] of Object.entries(EXERCISE_LIBRARY)) {
  const mk = LIBRARY_KEY_MAP[group];
  if (mk) exercises.forEach(ex => { EXERCISE_TO_MUSCLE[ex.id] = mk; });
}

export function computeMuscleRankings(workoutHistory: WorkoutHistory[]): MuscleData[] {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const scores: Record<MuscleKey, { score: number; sets: number }> =
    Object.fromEntries(
      (Object.keys(MUSCLE_META) as MuscleKey[]).map(k => [k, { score: 0, sets: 0 }])
    ) as Record<MuscleKey, { score: number; sets: number }>;

  for (const wo of workoutHistory) {
    if (new Date(wo.date).getTime() < cutoff) continue;
    for (const log of wo.exerciseLogs ?? []) {
      const mk = EXERCISE_TO_MUSCLE[log.exerciseId];
      if (!mk) continue;
      for (const set of log.sets) {
        scores[mk].score += (set.reps ?? 0) * Math.max(set.kg ?? 1, 1);
        scores[mk].sets += 1;
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores).map(s => s.score), 1);

  return (Object.keys(MUSCLE_META) as MuscleKey[]).map(key => {
    const norm = scores[key].score / maxScore;
    const intensity: MuscleData['intensity'] =
      norm === 0 ? 'none' : norm <= 0.3 ? 'low' : norm <= 0.7 ? 'medium' : 'high';
    return {
      key,
      name: MUSCLE_META[key].name,
      color: MUSCLE_META[key].color,
      score: scores[key].score,
      normalizedScore: norm,
      setsCompleted: scores[key].sets,
      intensity,
    };
  }).sort((a, b) => b.normalizedScore - a.normalizedScore);
}

export function getMuscleStyle(data: MuscleData | undefined): { fill: string; fillOpacity: number } {
  if (!data || data.normalizedScore === 0) return { fill: '#94a3b8', fillOpacity: 0.18 };
  const op = data.normalizedScore <= 0.3 ? 0.38 : data.normalizedScore <= 0.7 ? 0.65 : 0.88;
  return { fill: data.color, fillOpacity: op };
}
