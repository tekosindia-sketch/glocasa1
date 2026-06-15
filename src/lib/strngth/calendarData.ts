import { WorkoutHistory } from './types';

export interface CalendarSet {
  reps: number;
  weight: number;
}

export interface CalendarExercise {
  name: string;
  icon: string;
  category: string;
  sets: CalendarSet[];
  totalVolume: number;
  bestSet: CalendarSet;
}

export interface CalendarWorkout {
  date: string; // YYYY-MM-DD
  planName: string;
  duration: number; // seconds
  totalVolume: number;
  xpGained: number;
  intensity: 1 | 2 | 3 | 4;
  exercises: CalendarExercise[];
  isPR?: boolean;
}

function xpToIntensity(xp: number): 1 | 2 | 3 | 4 {
  if (xp >= 750) return 4;
  if (xp >= 500) return 3;
  if (xp >= 300) return 2;
  return 1;
}

/** Build a date → CalendarWorkout lookup from the user's real workout history. */
export function buildCalendarFromHistory(history: WorkoutHistory[]): Map<string, CalendarWorkout> {
  const map = new Map<string, CalendarWorkout>();
  // history is newest-first; iterate so the first entry for a date wins (most recent that day)
  for (const w of history) {
    const dateStr = w.date.split('T')[0];
    if (map.has(dateStr)) continue; // keep the most recent workout per day

    const logs = w.exerciseLogs ?? [];
    const exercises: CalendarExercise[] = logs.map(log => {
      const sets: CalendarSet[] = log.sets.map(s => ({ reps: s.reps, weight: s.kg }));
      const totalVolume = sets.reduce((a, s) => a + s.reps * s.weight, 0);
      const bestSet = sets.length > 0
        ? sets.reduce((best, s) => s.weight * s.reps > best.weight * best.reps ? s : best)
        : { reps: 0, weight: 0 };
      return { name: log.name, icon: '🏋️', category: '', sets, totalVolume, bestSet };
    });

    map.set(dateStr, {
      date: dateStr,
      planName: w.planName,
      duration: w.duration,
      totalVolume: w.totalVolume,
      xpGained: w.xpGained,
      intensity: xpToIntensity(w.xpGained),
      exercises,
    });
  }
  return map;
}

export function getWorkoutForDate(
  map: Map<string, CalendarWorkout>,
  dateStr: string,
): CalendarWorkout | undefined {
  return map.get(dateStr);
}

export function getIntensityForDate(
  map: Map<string, CalendarWorkout>,
  dateStr: string,
): 0 | 1 | 2 | 3 | 4 {
  const w = map.get(dateStr);
  return w ? w.intensity : 0;
}

export function getMonthStats(
  map: Map<string, CalendarWorkout>,
  year: number,
  month: number,
): { workouts: number; totalXP: number; totalVolume: number } {
  let workouts = 0, totalXP = 0, totalVolume = 0;
  map.forEach(w => {
    const d = new Date(w.date + 'T12:00:00');
    if (d.getFullYear() === year && d.getMonth() === month) {
      workouts++;
      totalXP += w.xpGained;
      totalVolume += w.totalVolume;
    }
  });
  return { workouts, totalXP, totalVolume };
}
