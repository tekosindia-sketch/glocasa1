import { ActiveWorkout, Player, Quest, WorkoutHistory } from './types';

/** Start of the local calendar day for the given timestamp. */
function startOfToday(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Time cutoff for a quest's window: daily → today, weekly → last 7 days. */
function windowCutoff(type: Quest['type'], now: number): number {
  return type === 'daily' ? startOfToday(now) : now - 7 * 24 * 60 * 60 * 1000;
}

/** Sum a per-completed-set value over the active workout. */
function reduceActiveSets<T>(
  active: ActiveWorkout | null,
  fn: (set: { reps: number; weight: number }, exerciseId: string) => number,
): number {
  if (!active) return 0;
  return active.exercises.reduce(
    (total, ex) =>
      total + ex.sets.filter(s => s.completed).reduce((a, s) => a + fn(s, ex.id), 0),
    0,
  );
}

/**
 * Live quest progress derived from real workout data within the quest's window,
 * including the in-progress active workout. Capped at the quest target so the
 * UI reads cleanly as `n/target`.
 */
export function computeQuestProgress(
  quest: Quest,
  history: WorkoutHistory[],
  activeWorkout: ActiveWorkout | null,
  player: Player,
  now: number = Date.now(),
): number {
  const metric = quest.metric;
  if (!metric) return quest.progress;

  // Streak isn't time-windowed — it's the player's current run.
  if (metric.kind === 'streak') {
    return Math.min(player.streak, quest.target);
  }

  const cutoff = windowCutoff(quest.type, now);
  const inWindow = history.filter(w => new Date(w.date).getTime() >= cutoff);

  let raw = 0;
  switch (metric.kind) {
    case 'sets':
      raw =
        inWindow.reduce((a, w) => a + w.totalSets, 0) +
        reduceActiveSets(activeWorkout, () => 1);
      break;
    case 'reps':
      raw =
        inWindow.reduce(
          (a, w) =>
            a +
            (w.exerciseLogs?.reduce(
              (ra, log) => ra + log.sets.reduce((sa, s) => sa + s.reps, 0),
              0,
            ) ?? 0),
          0,
        ) + reduceActiveSets(activeWorkout, s => s.reps);
      break;
    case 'volume':
      raw =
        inWindow.reduce((a, w) => a + w.totalVolume, 0) +
        reduceActiveSets(activeWorkout, s => s.reps * s.weight);
      break;
    case 'workouts':
      // Only finished workouts count toward "complete N workouts".
      raw = inWindow.length;
      break;
    case 'exerciseSets':
      raw =
        inWindow.reduce(
          (a, w) =>
            a +
            (w.exerciseLogs?.find(l => l.exerciseId === metric.exerciseId)?.sets.length ?? 0),
          0,
        ) +
        reduceActiveSets(activeWorkout, (_s, exerciseId) =>
          exerciseId === metric.exerciseId ? 1 : 0,
        );
      break;
  }

  return Math.min(raw, quest.target);
}
