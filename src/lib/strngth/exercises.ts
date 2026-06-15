import type { WorkoutHistory } from './types';

export interface LibraryExercise {
  id: string;
  name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xpPerSet: number;
  sets: number;
  reps: string;
  image?: string;
}

export const MUSCLE_GROUPS = [
  { id: 'chest',      name: 'Chest',      color: '#ef4444' },
  { id: 'biceps',     name: 'Biceps',     color: '#3b82f6' },
  { id: 'triceps',    name: 'Triceps',    color: '#8b5cf6' },
  { id: 'back',       name: 'Back',       color: '#f97316' },
  { id: 'shoulders',  name: 'Shoulders',  color: '#06b6d4' },
  { id: 'abs',        name: 'Abs',        color: '#10b981' },
  { id: 'quadriceps', name: 'Quadriceps', color: '#f59e0b' },
  { id: 'hamstrings', name: 'Hamstrings', color: '#ec4899' },
  { id: 'hips',       name: 'Hips',       color: '#a78bfa' },
  { id: 'calves',     name: 'Calves',     color: '#34d399' },
  { id: 'forearms',   name: 'Forearms',   color: '#fb923c' },
  { id: 'neck',       name: 'Neck',       color: '#94a3b8' },
] as const;

export const MUSCLE_IMAGES: Partial<Record<string, string>> = {
  chest:      '/strngth/muscles/chest.png',
  biceps:     '/strngth/muscles/biceps.png',
  triceps:    '/strngth/muscles/triceps.png',
  back:       '/strngth/muscles/back.png',
  shoulders:  '/strngth/muscles/shoulders.png',
  abs:        '/strngth/muscles/abs.png',
  quadriceps: '/strngth/muscles/quadriceps.png',
  hamstrings: '/strngth/muscles/hamstrings.png',
  hips:       '/strngth/muscles/hips.png',
  calves:     '/strngth/muscles/calves.png',
  forearms:   '/strngth/muscles/forearms.png',
  neck:       '/strngth/muscles/neck.png',
};

export const DIFF_COLORS: Record<string, string> = {
  Beginner:     '#10b981',
  Intermediate: '#f59e0b',
  Advanced:     '#ef4444',
};

export const EXERCISE_LIBRARY: Record<string, LibraryExercise[]> = {
  chest: [
    { id: 'bench-press',   name: 'Bench Press',        category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 40, sets: 3, reps: '6–8',   image: '/strngth/exercises/bench-press-v2.png' },
    { id: 'incline-press', name: 'Incline DB Press',   category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 35, sets: 3, reps: '8–10',  image: '/strngth/exercises/incline-db-press-v2.png' },
    { id: 'cable-fly',     name: 'Cable Fly',           category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '12–15', image: '/strngth/exercises/cable-fly-v2.png' },
    { id: 'push-up',       name: 'Push-Up',             category: 'Bodyweight', difficulty: 'Beginner',     xpPerSet: 20, sets: 3, reps: '15–20', image: '/strngth/exercises/push-up-v2.png' },
    { id: 'pec-deck',      name: 'Pec Deck',            category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '12–15', image: '/strngth/exercises/pec-deck-v2.png' },
    { id: 'dips-chest',    name: 'Chest Dips',          category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 35, sets: 3, reps: '8–12',  image: '/strngth/exercises/chest-dips-v2.png' },
  ],
  biceps: [
    { id: 'barbell-curl',  name: 'Barbell Curl',        category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '10–12', image: '/strngth/exercises/barbell-curl-v2.png' },
    { id: 'hammer-curl',   name: 'Hammer Curl',         category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '10–12', image: '/strngth/exercises/hammer-curl-v2.png' },
    { id: 'incline-curl',  name: 'Incline DB Curl',     category: 'Isolation',  difficulty: 'Intermediate', xpPerSet: 30, sets: 3, reps: '10–12', image: '/strngth/exercises/incline-curl-v2.png' },
    { id: 'cable-curl',    name: 'Cable Curl',          category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '12–15', image: '/strngth/exercises/cable-curl-v2.png' },
    { id: 'preacher-curl', name: 'Preacher Curl',       category: 'Isolation',  difficulty: 'Intermediate', xpPerSet: 30, sets: 3, reps: '10–12', image: '/strngth/exercises/preacher-curl-v2.png' },
  ],
  triceps: [
    { id: 'skullcrusher',  name: 'Skull Crusher',       category: 'Isolation',  difficulty: 'Intermediate', xpPerSet: 30, sets: 3, reps: '10–12', image: '/strngth/exercises/skull-crusher-v2.png' },
    { id: 'pushdown',      name: 'Cable Pushdown',      category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '12–15', image: '/strngth/exercises/cable-pushdown-v2.png' },
    { id: 'overhead-ext',  name: 'Overhead Extension',  category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '12–15', image: '/strngth/exercises/overhead-ext-v2.png' },
    { id: 'close-bench',   name: 'Close-Grip Bench',    category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 35, sets: 3, reps: '8–10',  image: '/strngth/exercises/close-bench-v2.png' },
    { id: 'dips-tri',      name: 'Tricep Dips',         category: 'Bodyweight', difficulty: 'Intermediate', xpPerSet: 30, sets: 3, reps: '10–15', image: '/strngth/exercises/tricep-dips-v2.png' },
  ],
  back: [
    { id: 'deadlift',      name: 'Deadlift',            category: 'Compound',   difficulty: 'Advanced',     xpPerSet: 70, sets: 3, reps: '4–6',   image: '/strngth/exercises/deadlift-v2.png' },
    { id: 'pull-up',       name: 'Pull-Up',             category: 'Bodyweight', difficulty: 'Intermediate', xpPerSet: 45, sets: 3, reps: '6–10',  image: '/strngth/exercises/pull-up-v2.png' },
    { id: 'barbell-row',   name: 'Barbell Row',         category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 45, sets: 3, reps: '6–8',   image: '/strngth/exercises/barbell-row-v2.png' },
    { id: 'cable-row',     name: 'Cable Row',           category: 'Compound',   difficulty: 'Beginner',     xpPerSet: 35, sets: 3, reps: '10–12', image: '/strngth/exercises/cable-row-v2.png' },
    { id: 'lat-pulldown',  name: 'Lat Pulldown',        category: 'Compound',   difficulty: 'Beginner',     xpPerSet: 35, sets: 3, reps: '10–12', image: '/strngth/exercises/lat-pulldown-v2.png' },
    { id: 'single-row',    name: 'Single-Arm Row',      category: 'Compound',   difficulty: 'Beginner',     xpPerSet: 30, sets: 3, reps: '10–12', image: '/strngth/exercises/single-row-v2.png' },
  ],
  shoulders: [
    { id: 'ohp',           name: 'Overhead Press',      category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 40, sets: 3, reps: '6–8',   image: '/strngth/exercises/ohp-v2.png' },
    { id: 'lateral-raise', name: 'Lateral Raise',       category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 20, sets: 3, reps: '12–15', image: '/strngth/exercises/lateral-raise-v2.png' },
    { id: 'front-raise',   name: 'Front Raise',         category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 20, sets: 3, reps: '12–15', image: '/strngth/exercises/front-raise-v2.png' },
    { id: 'face-pull',     name: 'Face Pull',           category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '15–20', image: '/strngth/exercises/face-pull-v2.png' },
    { id: 'arnold-press',  name: 'Arnold Press',        category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 35, sets: 3, reps: '8–10',  image: '/strngth/exercises/arnold-press-v2.png' },
  ],
  abs: [
    { id: 'crunch',        name: 'Crunch',              category: 'Bodyweight', difficulty: 'Beginner',     xpPerSet: 15, sets: 3, reps: '20–25', image: '/strngth/exercises/crunch-v2.png' },
    { id: 'plank',         name: 'Plank',               category: 'Bodyweight', difficulty: 'Beginner',     xpPerSet: 20, sets: 3, reps: '45s',   image: '/strngth/exercises/plank-v2.png' },
    { id: 'leg-raise',     name: 'Hanging Leg Raise',   category: 'Bodyweight', difficulty: 'Intermediate', xpPerSet: 30, sets: 3, reps: '12–15', image: '/strngth/exercises/leg-raise-v2.png' },
    { id: 'cable-crunch',  name: 'Cable Crunch',        category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '15–20', image: '/strngth/exercises/cable-crunch-v2.png' },
    { id: 'ab-wheel',      name: 'Ab Wheel Rollout',    category: 'Bodyweight', difficulty: 'Advanced',     xpPerSet: 35, sets: 3, reps: '10–12', image: '/strngth/exercises/ab-wheel-v2.png' },
  ],
  quadriceps: [
    { id: 'squat',         name: 'Back Squat',          category: 'Compound',   difficulty: 'Advanced',     xpPerSet: 60, sets: 3, reps: '5–8',   image: '/strngth/exercises/squat-v2.png' },
    { id: 'leg-press',     name: 'Leg Press',           category: 'Compound',   difficulty: 'Beginner',     xpPerSet: 40, sets: 3, reps: '10–15', image: '/strngth/exercises/leg-press-v2.png' },
    { id: 'front-squat',   name: 'Front Squat',         category: 'Compound',   difficulty: 'Advanced',     xpPerSet: 55, sets: 3, reps: '5–8',   image: '/strngth/exercises/front-squat-v2.png' },
    { id: 'leg-ext',       name: 'Leg Extension',       category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '12–15', image: '/strngth/exercises/leg-ext-v2.png' },
    { id: 'lunge',         name: 'Walking Lunge',       category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 35, sets: 3, reps: '10–12', image: '/strngth/exercises/lunge-v2.png' },
  ],
  hamstrings: [
    { id: 'rdl',           name: 'Romanian Deadlift',   category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 55, sets: 3, reps: '8–10',  image: '/strngth/exercises/rdl-v2.png' },
    { id: 'leg-curl',      name: 'Lying Leg Curl',      category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '12–15', image: '/strngth/exercises/leg-curl-v2.png' },
    { id: 'seated-curl',   name: 'Seated Leg Curl',     category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 25, sets: 3, reps: '12–15', image: '/strngth/exercises/seated-curl-v2.png' },
    { id: 'glute-bridge',  name: 'Glute Bridge',        category: 'Bodyweight', difficulty: 'Beginner',     xpPerSet: 20, sets: 3, reps: '15–20', image: '/strngth/exercises/glute-bridge-v2.png' },
    { id: 'good-morning',  name: 'Good Morning',        category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 40, sets: 3, reps: '10–12', image: '/strngth/exercises/good-morning-v2.png' },
  ],
  hips: [
    { id: 'hip-thrust',    name: 'Hip Thrust',          category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 45, sets: 3, reps: '10–12', image: '/strngth/exercises/hip-thrust-v2.png' },
    { id: 'sumo-squat',    name: 'Sumo Squat',          category: 'Compound',   difficulty: 'Intermediate', xpPerSet: 40, sets: 3, reps: '10–12', image: '/strngth/exercises/sumo-squat-v2.png' },
    { id: 'clamshell',     name: 'Clamshell',           category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 15, sets: 3, reps: '15–20', image: '/strngth/exercises/clamshell-v2.png' },
    { id: 'hip-abduct',    name: 'Hip Abduction',       category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 20, sets: 3, reps: '15–20', image: '/strngth/exercises/hip-abduct-v2.png' },
  ],
  calves: [
    { id: 'standing-raise',name: 'Standing Calf Raise', category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 20, sets: 3, reps: '15–20', image: '/strngth/exercises/standing-raise-v2.png' },
    { id: 'seated-raise',  name: 'Seated Calf Raise',   category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 20, sets: 3, reps: '15–20', image: '/strngth/exercises/seated-raise-v2.png' },
    { id: 'donkey-raise',  name: 'Donkey Calf Raise',   category: 'Isolation',  difficulty: 'Intermediate', xpPerSet: 25, sets: 3, reps: '15–20', image: '/strngth/exercises/donkey-raise-v2.png' },
  ],
  forearms: [
    { id: 'wrist-curl',    name: 'Wrist Curl',          category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 15, sets: 3, reps: '15–20', image: '/strngth/exercises/wrist-curl-v2.png' },
    { id: 'rev-wrist',     name: 'Reverse Wrist Curl',  category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 15, sets: 3, reps: '15–20', image: '/strngth/exercises/rev-wrist-v2.png' },
    { id: 'farmers-walk',  name: "Farmer's Walk",       category: 'Compound',   difficulty: 'Beginner',     xpPerSet: 30, sets: 3, reps: '30m',   image: '/strngth/exercises/farmers-walk-v2.png' },
    { id: 'dead-hang',     name: 'Dead Hang',           category: 'Bodyweight', difficulty: 'Beginner',     xpPerSet: 20, sets: 3, reps: '30s',   image: '/strngth/exercises/dead-hang-v2.png' },
  ],
  neck: [
    { id: 'neck-flex',     name: 'Neck Flexion',        category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 15, sets: 3, reps: '15–20', image: '/strngth/exercises/neck-flex-v2.png' },
    { id: 'neck-ext',      name: 'Neck Extension',      category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 15, sets: 3, reps: '15–20', image: '/strngth/exercises/neck-ext-v2.png' },
    { id: 'shrugs',        name: 'Barbell Shrugs',      category: 'Isolation',  difficulty: 'Beginner',     xpPerSet: 20, sets: 3, reps: '12–15', image: '/strngth/exercises/shrugs-v2.png' },
  ],
};

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export interface FlatExercise extends LibraryExercise {
  muscleGroup: MuscleGroup;
}

export const ALL_EXERCISES: FlatExercise[] = MUSCLE_GROUPS.flatMap(g =>
  (EXERCISE_LIBRARY[g.id] ?? []).map(ex => ({ ...ex, muscleGroup: g }))
);

export function parseReps(reps: string): number {
  const match = reps.match(/\d+/);
  return match ? parseInt(match[0]) : 10;
}

// ─── Per-Exercise Badge System ───────────────────────────────────────────────

export type ExBadgeRank = 'none' | 'wood' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'champion' | 'titan' | 'olympian';

export const EX_BADGE_CONFIGS: Array<{
  rank: ExBadgeRank; label: string; color: string; glow: string; min: number; next: number;
}> = [
  { rank: 'none',     label: 'Unranked', color: 'rgba(200,210,230,0.3)', glow: 'transparent', min: 0,   next: 1    },
  { rank: 'wood',     label: 'Wood',     color: '#d97235',               glow: '#d97235',     min: 1,   next: 10   },
  { rank: 'bronze',   label: 'Bronze',   color: '#cd7f32',               glow: '#cd7f32',     min: 10,  next: 25   },
  { rank: 'silver',   label: 'Silver',   color: '#aab8c8',               glow: '#c8d8e8',     min: 25,  next: 50   },
  { rank: 'gold',     label: 'Gold',     color: '#ffd700',               glow: '#ffd700',     min: 50,  next: 100  },
  { rank: 'platinum', label: 'Platinum', color: '#22d3ee',               glow: '#22d3ee',     min: 100, next: 200  },
  { rank: 'diamond',  label: 'Diamond',  color: '#818cf8',               glow: '#a78bfa',     min: 200, next: 350  },
  { rank: 'champion', label: 'Champion', color: '#c084fc',               glow: '#e879f9',     min: 350, next: 500  },
  { rank: 'titan',    label: 'Titan',    color: '#ef4444',               glow: '#f97316',     min: 500, next: 750  },
  { rank: 'olympian', label: 'Olympian', color: '#f59e0b',               glow: '#fbbf24',     min: 750, next: Infinity },
];

export const BADGE_IMAGES: Partial<Record<ExBadgeRank, string>> = {
  wood:     '/strngth/badges/badge-wood.png',
  bronze:   '/strngth/badges/badge-bronze.png',
  silver:   '/strngth/badges/badge-silver.png',
  gold:     '/strngth/badges/badge-gold.png',
  platinum: '/strngth/badges/badge-platinum.png',
  diamond:  '/strngth/badges/badge-diamond.png',
  champion: '/strngth/badges/badge-champion.png',
  titan:    '/strngth/badges/badge-titan.png',
  olympian: '/strngth/badges/badge-olympian.png',
};

export function getExerciseSets(exerciseId: string, history: WorkoutHistory[]): number {
  return history.reduce((total, w) => {
    const log = w.exerciseLogs?.find(l => l.exerciseId === exerciseId);
    return total + (log?.sets.length ?? 0);
  }, 0);
}

export function getExerciseBadgeRank(totalSets: number): ExBadgeRank {
  if (totalSets >= 750) return 'olympian';
  if (totalSets >= 500) return 'titan';
  if (totalSets >= 350) return 'champion';
  if (totalSets >= 200) return 'diamond';
  if (totalSets >= 100) return 'platinum';
  if (totalSets >= 50)  return 'gold';
  if (totalSets >= 25)  return 'silver';
  if (totalSets >= 10)  return 'bronze';
  if (totalSets >= 1)   return 'wood';
  return 'none';
}
