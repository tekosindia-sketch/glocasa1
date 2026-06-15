export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export interface RankConfig {
  rank: Rank;
  label: string;
  color: string;
  glow: string;
  aura: string;
  minXP: number;
  maxXP: number;
  title: string;
}

export interface PersonalRecord {
  exercise: string;
  weight: number;
  reps: number;
  date: string;
  unit: string;
}

export interface Player {
  id: string;
  username: string;
  title: string;
  level: number;
  totalXP: number;
  rank: Rank;
  streak: number;
  longestStreak?: number;
  lastWorkoutDate: string | null;
  totalWorkouts: number;
  auraColor: string;
  avatarInitials: string;
  personalRecords: PersonalRecord[];
  joinedDate: string;
  totalVolume: number;
  guild: string | null;
}

export type QuestMetric =
  | { kind: 'sets' }                              // completed sets in window
  | { kind: 'reps' }                              // completed reps in window
  | { kind: 'volume' }                            // kg lifted in window
  | { kind: 'workouts' }                          // finished workouts in window
  | { kind: 'exerciseSets'; exerciseId: string }  // sets of one exercise in window
  | { kind: 'streak' };                           // player.streak vs target

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  type: 'daily' | 'weekly' | 'special';
  icon: string;
  completed: boolean;
  expiresAt: string;
  metric?: QuestMetric;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ExerciseSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  icon: string;
  sets: ExerciseSet[];
  targetSets: number;
  targetReps: number;
  xpPerSet: number;
}

export interface ActiveWorkout {
  id: string;
  planName: string;
  startedAt: number;
  exercises: Exercise[];
  totalXPGained: number;
  restTimerActive: boolean;
  restTimerSeconds: number;
  restTimerMax: number;
  note?: string;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  sets: { kg: number; reps: number }[];
}

export interface WorkoutHistory {
  id: string;
  planName: string;
  date: string;
  duration: number;
  totalVolume: number;
  xpGained: number;
  exercises: number;
  totalSets: number;
  exerciseLogs?: ExerciseLog[];
  note?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  playerRank: Rank;
  level: number;
  totalXP: number;
  streak: number;
  isCurrentUser: boolean;
  guild: string | null;
  auraColor: string;
}

export interface FeedItem {
  id: string;
  userId: string;
  username: string;
  playerRank: Rank;
  type: 'workout' | 'levelup' | 'badge' | 'pr' | 'streak';
  content: string;
  detail: string;
  timestamp: string;
  xpGained?: number;
  likes: number;
  liked: boolean;
}

export interface XPGain {
  id: string;
  amount: number;
  source: string;
  timestamp: number;
}

export interface LevelUpData {
  newLevel: number;
  newRank?: Rank;
  previousRank?: Rank;
}

export interface Guild {
  id: string;
  name: string;
  tag: string;
  color: string;
  members: number;
  rank: number;
  weeklyXP: number;
  description: string;
}

export interface GymNotification {
  id: string;
  type: 'quest' | 'xp' | 'levelup' | 'streak' | 'social' | 'badge';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  icon: string;
  color: string;
}

export interface ProgramExercise {
  id: string;
  name: string;
  category: string;
  targetSets: number;
  targetReps: number;
  xpPerSet: number;
}

export interface UserProgram {
  id: string;
  name: string;
  exercises: ProgramExercise[];
  createdAt: string;
}
