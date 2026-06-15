import { Badge, FeedItem, Guild, GymNotification, LeaderboardEntry, Player, Quest, WorkoutHistory } from './types';

export const MOCK_PLAYER: Player = {
  id: 'current-user',
  username: '',
  title: 'Novice Hunter',
  level: 1,
  totalXP: 0,
  rank: 'E',
  streak: 0,
  lastWorkoutDate: null,
  totalWorkouts: 0,
  auraColor: '#6b7280',
  avatarInitials: '',
  guild: null,
  totalVolume: 0,
  joinedDate: new Date().toISOString().split('T')[0],
  personalRecords: [],
};

export const MOCK_DAILY_QUESTS: Quest[] = [
  {
    id: 'dq1', title: 'Set Crusher', description: 'Complete 12 sets today',
    xpReward: 150, progress: 0, target: 12, type: 'daily', icon: '⚔️', completed: false,
    expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
    metric: { kind: 'sets' },
  },
  {
    id: 'dq2', title: 'Rep Hunter', description: 'Complete 80 reps today',
    xpReward: 120, progress: 0, target: 80, type: 'daily', icon: '🌑', completed: false,
    expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
    metric: { kind: 'reps' },
  },
  {
    id: 'dq3', title: 'Daily Grind', description: 'Finish 1 workout today',
    xpReward: 100, progress: 0, target: 1, type: 'daily', icon: '🛡️', completed: false,
    expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
    metric: { kind: 'workouts' },
  },
  {
    id: 'dq4', title: 'Tonnage', description: 'Lift 3,000 kg of volume today',
    xpReward: 180, progress: 0, target: 3000, type: 'daily', icon: '🌅', completed: false,
    expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
    metric: { kind: 'volume' },
  },
];

export const MOCK_WEEKLY_QUESTS: Quest[] = [
  {
    id: 'wq1', title: 'Elite Protocol', description: 'Complete 5 workouts this week',
    xpReward: 800, progress: 0, target: 5, type: 'weekly', icon: '🏆', completed: false,
    expiresAt: new Date(Date.now() + 4 * 24 * 3600000).toISOString(),
    metric: { kind: 'workouts' },
  },
  {
    id: 'wq2', title: 'Volume Lord', description: 'Lift 25,000 kg total volume this week',
    xpReward: 600, progress: 0, target: 25000, type: 'weekly', icon: '⚡', completed: false,
    expiresAt: new Date(Date.now() + 4 * 24 * 3600000).toISOString(),
    metric: { kind: 'volume' },
  },
  {
    id: 'wq3', title: 'Century Sets', description: 'Complete 60 sets this week',
    xpReward: 500, progress: 0, target: 60, type: 'weekly', icon: '💯', completed: false,
    expiresAt: new Date(Date.now() + 4 * 24 * 3600000).toISOString(),
    metric: { kind: 'sets' },
  },
  {
    id: 'wq4', title: 'Undying Flame', description: 'Maintain a 7-day streak',
    xpReward: 1200, progress: 0, target: 7, type: 'weekly', icon: '🔥', completed: false,
    expiresAt: new Date(Date.now() + 4 * 24 * 3600000).toISOString(),
    metric: { kind: 'streak' },
  },
];

export const MOCK_BADGES: Badge[] = [
  { id: 'b1', name: 'First Blood', description: 'Complete your first workout', icon: '⚔️', color: '#ef4444', unlocked: false, unlockedAt: null, rarity: 'common' },
  { id: 'b2', name: 'Iron Will', description: 'Complete 50 workouts', icon: '🛡️', color: '#8b5cf6', unlocked: false, unlockedAt: null, rarity: 'rare' },
  { id: 'b3', name: 'Streak Master', description: 'Achieve a 30-day streak', icon: '🔥', color: '#f97316', unlocked: false, unlockedAt: null, rarity: 'epic' },
  { id: 'b4', name: 'Shadow Hunter', description: 'Reach A Rank', icon: '🌑', color: '#f59e0b', unlocked: false, unlockedAt: null, rarity: 'epic' },
  { id: 'b5', name: 'Volume King', description: 'Lift 1,000,000 kg lifetime', icon: '👑', color: '#f59e0b', unlocked: false, unlockedAt: null, rarity: 'legendary' },
  { id: 'b6', name: 'Century Club', description: 'Complete 100 workouts', icon: '💯', color: '#10b981', unlocked: false, unlockedAt: null, rarity: 'rare' },
  { id: 'b7', name: 'Monarch', description: 'Reach SS Rank', icon: '💎', color: '#ec4899', unlocked: false, unlockedAt: null, rarity: 'legendary' },
  { id: 'b8', name: 'Guild Captain', description: 'Lead a guild to top 10', icon: '⚡', color: '#00d4ff', unlocked: false, unlockedAt: null, rarity: 'epic' },
  { id: 'b9', name: 'Early Bird', description: 'Workout before 7am, 10 times', icon: '🌅', color: '#f59e0b', unlocked: false, unlockedAt: null, rarity: 'common' },
  { id: 'b10', name: 'Apex Predator', description: 'Reach SSS Rank', icon: '🔮', color: '#ec4899', unlocked: false, unlockedAt: null, rarity: 'legendary' },
  { id: 'b11', name: 'Iron Legion', description: 'Join a guild', icon: '⚔️', color: '#3b82f6', unlocked: false, unlockedAt: null, rarity: 'common' },
  { id: 'b12', name: 'Phantom Speed', description: 'Complete a workout in under 30 mins', icon: '💨', color: '#00d4ff', unlocked: false, unlockedAt: null, rarity: 'rare' },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'u1', username: 'Void_Emperor', playerRank: 'SSS', level: 99, totalXP: 487320, streak: 180, isCurrentUser: false, guild: 'Abyss Order', auraColor: '#ec4899' },
  { rank: 2, userId: 'u2', username: 'Crimson_Alpha', playerRank: 'SS', level: 87, totalXP: 312450, streak: 95, isCurrentUser: false, guild: 'Crimson Fang', auraColor: '#ef4444' },
  { rank: 3, userId: 'u3', username: 'NightBlade_99', playerRank: 'S', level: 73, totalXP: 198750, streak: 67, isCurrentUser: false, guild: 'Night Order', auraColor: '#f97316' },
  { rank: 4, userId: 'u5', username: 'IronWill_Pro', playerRank: 'A', level: 44, totalXP: 72100, streak: 31, isCurrentUser: false, guild: 'Iron Legion', auraColor: '#f59e0b' },
  { rank: 5, userId: 'u6', username: 'Phantom_Strike', playerRank: 'B', level: 38, totalXP: 54300, streak: 22, isCurrentUser: false, guild: 'Ghost Division', auraColor: '#8b5cf6' },
  { rank: 6, userId: 'u7', username: 'ZeroGravity_X', playerRank: 'B', level: 35, totalXP: 49800, streak: 18, isCurrentUser: false, guild: 'Abyss Order', auraColor: '#8b5cf6' },
  { rank: 7, userId: 'u8', username: 'TitanFist_K', playerRank: 'B', level: 33, totalXP: 42750, streak: 14, isCurrentUser: false, guild: null, auraColor: '#8b5cf6' },
  { rank: 8, userId: 'u9', username: 'StormBreaker', playerRank: 'C', level: 29, totalXP: 28100, streak: 9, isCurrentUser: false, guild: 'Storm Riders', auraColor: '#10b981' },
  { rank: 9, userId: 'u10', username: 'SilverEdge_7', playerRank: 'C', level: 26, totalXP: 22400, streak: 7, isCurrentUser: false, guild: null, auraColor: '#10b981' },
];

export const MOCK_FEED: FeedItem[] = [
  { id: 'f1', userId: 'u1', username: 'Void_Emperor', playerRank: 'SSS', type: 'levelup', content: 'reached Level 99', detail: 'The ultimate hunter awakens.', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), xpGained: 2000, likes: 247, liked: false },
  { id: 'f2', userId: 'u2', username: 'Crimson_Alpha', playerRank: 'SS', type: 'pr', content: 'set a new PR', detail: 'Deadlift: 280 kg × 1 rep 💀', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), xpGained: 500, likes: 134, liked: true },
  { id: 'f3', userId: 'u3', username: 'NightBlade_99', playerRank: 'S', type: 'workout', content: 'obliterated a workout', detail: 'Upper Body Protocol • 1h 12m • 8,420 kg', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), xpGained: 680, likes: 89, liked: false },
  { id: 'f4', userId: 'u5', username: 'IronWill_Pro', playerRank: 'A', type: 'streak', content: 'hit a 31-day streak', detail: 'Unstoppable. Unbreakable.', timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), xpGained: 300, likes: 67, liked: false },
  { id: 'f5', userId: 'u6', username: 'Phantom_Strike', playerRank: 'B', type: 'badge', content: 'unlocked Shadow Hunter badge', detail: 'Reached A Rank ⚡', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), xpGained: 1200, likes: 45, liked: true },
  { id: 'f6', userId: 'u7', username: 'ZeroGravity_X', playerRank: 'B', type: 'workout', content: 'crushed leg day', detail: 'Squat 160 kg • Leg Press 400 kg • 1h 45m', timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), xpGained: 720, likes: 38, liked: false },
];

export const MOCK_GUILDS: Guild[] = [
  { id: 'g1', name: 'Iron Legion', tag: 'IRON', color: '#f59e0b', members: 48, rank: 3, weeklyXP: 284700, description: 'Forged in iron. Built to dominate.' },
  { id: 'g2', name: 'Abyss Order', tag: 'VOID', color: '#ec4899', members: 50, rank: 1, weeklyXP: 412800, description: 'From the abyss, we rise.' },
  { id: 'g3', name: 'Crimson Fang', tag: 'FANG', color: '#ef4444', members: 45, rank: 2, weeklyXP: 334200, description: 'Hunt without mercy.' },
  { id: 'g4', name: 'Night Order', tag: 'NITE', color: '#8b5cf6', members: 42, rank: 4, weeklyXP: 221500, description: 'The night belongs to us.' },
  { id: 'g5', name: 'Storm Riders', tag: 'STRM', color: '#00d4ff', members: 38, rank: 5, weeklyXP: 198300, description: 'We ride the storm.' },
];

export const MOCK_WORKOUT_HISTORY: WorkoutHistory[] = [];

const _UNUSED_WORKOUT_HISTORY: WorkoutHistory[] = [
  {
    id: 'wh1', planName: 'Upper Body Protocol',
    date: new Date(Date.now() - 6 * 3600000).toISOString(),
    duration: 4200, totalVolume: 8420, xpGained: 680, exercises: 6, totalSets: 24,
    exerciseLogs: [
      { exerciseId: 'bench-press',   name: 'Bench Press',      sets: [{kg:80,reps:8},{kg:80,reps:8},{kg:77,reps:7},{kg:75,reps:7}] },
      { exerciseId: 'incline-press', name: 'Incline DB Press', sets: [{kg:60,reps:10},{kg:60,reps:9},{kg:57,reps:9}] },
      { exerciseId: 'pull-up',       name: 'Pull-Up',          sets: [{kg:0,reps:8},{kg:0,reps:7},{kg:0,reps:7},{kg:0,reps:6}] },
      { exerciseId: 'cable-row',     name: 'Cable Row',        sets: [{kg:65,reps:12},{kg:65,reps:11},{kg:63,reps:10}] },
      { exerciseId: 'ohp',           name: 'Overhead Press',   sets: [{kg:55,reps:10},{kg:55,reps:9},{kg:52,reps:9}] },
      { exerciseId: 'pushdown',      name: 'Cable Pushdown',   sets: [{kg:35,reps:12},{kg:35,reps:12},{kg:33,reps:10}] },
    ],
  },
  {
    id: 'wh2', planName: 'Leg Destroyer',
    date: new Date(Date.now() - 30 * 3600000).toISOString(),
    duration: 5400, totalVolume: 12800, xpGained: 920, exercises: 5, totalSets: 20,
    exerciseLogs: [
      { exerciseId: 'back-squat',    name: 'Back Squat',          sets: [{kg:100,reps:6},{kg:100,reps:6},{kg:95,reps:5},{kg:90,reps:5}] },
      { exerciseId: 'deadlift',      name: 'Deadlift',            sets: [{kg:120,reps:5},{kg:120,reps:4},{kg:115,reps:4}] },
      { exerciseId: 'leg-press',     name: 'Leg Press',           sets: [{kg:150,reps:12},{kg:150,reps:11},{kg:140,reps:10},{kg:140,reps:10}] },
      { exerciseId: 'leg-curl',      name: 'Leg Curl',            sets: [{kg:45,reps:10},{kg:45,reps:9},{kg:42,reps:9}] },
      { exerciseId: 'standing-calf', name: 'Standing Calf Raise', sets: [{kg:60,reps:15},{kg:60,reps:14},{kg:55,reps:12},{kg:55,reps:12}] },
    ],
  },
  {
    id: 'wh3', planName: 'Push Protocol',
    date: new Date(Date.now() - 54 * 3600000).toISOString(),
    duration: 3600, totalVolume: 7200, xpGained: 560, exercises: 5, totalSets: 20,
    exerciseLogs: [
      { exerciseId: 'bench-press',   name: 'Bench Press',      sets: [{kg:82,reps:8},{kg:82,reps:7},{kg:80,reps:7},{kg:77,reps:6}] },
      { exerciseId: 'incline-press', name: 'Incline DB Press', sets: [{kg:62,reps:9},{kg:60,reps:9},{kg:58,reps:8}] },
      { exerciseId: 'cable-fly',     name: 'Cable Fly',        sets: [{kg:18,reps:14},{kg:18,reps:13},{kg:16,reps:12}] },
      { exerciseId: 'ohp',           name: 'Overhead Press',   sets: [{kg:57,reps:9},{kg:55,reps:8},{kg:52,reps:8}] },
      { exerciseId: 'pushdown',      name: 'Cable Pushdown',   sets: [{kg:36,reps:12},{kg:36,reps:11},{kg:34,reps:10},{kg:32,reps:10}] },
    ],
  },
  {
    id: 'wh4', planName: 'Pull Day',
    date: new Date(Date.now() - 78 * 3600000).toISOString(),
    duration: 4800, totalVolume: 9100, xpGained: 740, exercises: 6, totalSets: 22,
    exerciseLogs: [
      { exerciseId: 'deadlift',     name: 'Deadlift',     sets: [{kg:122,reps:4},{kg:120,reps:4},{kg:118,reps:4},{kg:115,reps:5}] },
      { exerciseId: 'pull-up',      name: 'Pull-Up',      sets: [{kg:0,reps:9},{kg:0,reps:8},{kg:0,reps:7},{kg:0,reps:6}] },
      { exerciseId: 'barbell-row',  name: 'Barbell Row',  sets: [{kg:80,reps:8},{kg:80,reps:7},{kg:75,reps:7},{kg:75,reps:7}] },
      { exerciseId: 'cable-row',    name: 'Cable Row',    sets: [{kg:67,reps:11},{kg:67,reps:10},{kg:65,reps:10}] },
      { exerciseId: 'lat-pulldown', name: 'Lat Pulldown', sets: [{kg:65,reps:11},{kg:63,reps:10},{kg:60,reps:10}] },
      { exerciseId: 'barbell-curl', name: 'Barbell Curl', sets: [{kg:38,reps:10},{kg:36,reps:10},{kg:34,reps:9}] },
    ],
  },
  {
    id: 'wh5', planName: 'Full Body Circuit',
    date: new Date(Date.now() - 102 * 3600000).toISOString(),
    duration: 3000, totalVolume: 5600, xpGained: 440, exercises: 8, totalSets: 16,
    exerciseLogs: [
      { exerciseId: 'deadlift',    name: 'Deadlift',       sets: [{kg:115,reps:4},{kg:115,reps:4},{kg:112,reps:4}] },
      { exerciseId: 'bench-press', name: 'Bench Press',    sets: [{kg:78,reps:7},{kg:75,reps:7},{kg:75,reps:6}] },
      { exerciseId: 'pull-up',     name: 'Pull-Up',        sets: [{kg:0,reps:7},{kg:0,reps:6},{kg:0,reps:6}] },
      { exerciseId: 'ohp',         name: 'Overhead Press', sets: [{kg:52,reps:8},{kg:50,reps:7}] },
      { exerciseId: 'barbell-row', name: 'Barbell Row',    sets: [{kg:75,reps:7},{kg:72,reps:7}] },
    ],
  },
];

export const MOCK_NOTIFICATIONS: GymNotification[] = [];

export const DEFAULT_WORKOUT_PLANS = [
  {
    name: 'Upper Body Protocol',
    exercises: [
      { id: 'e1', name: 'Bench Press', category: 'Chest', icon: '⚔️', sets: [], targetSets: 3, targetReps: 8, xpPerSet: 40 },
      { id: 'e2', name: 'Incline DB Press', category: 'Chest', icon: '🗡️', sets: [], targetSets: 3, targetReps: 10, xpPerSet: 35 },
      { id: 'e3', name: 'Pull-Ups', category: 'Back', icon: '🌑', sets: [], targetSets: 3, targetReps: 8, xpPerSet: 45 },
      { id: 'e4', name: 'Cable Row', category: 'Back', icon: '⚡', sets: [], targetSets: 3, targetReps: 12, xpPerSet: 35 },
      { id: 'e5', name: 'Overhead Press', category: 'Shoulders', icon: '🛡️', sets: [], targetSets: 3, targetReps: 10, xpPerSet: 40 },
      { id: 'e6', name: 'Tricep Dips', category: 'Arms', icon: '💪', sets: [], targetSets: 3, targetReps: 12, xpPerSet: 30 },
    ],
  },
  {
    name: 'Leg Destroyer',
    exercises: [
      { id: 'e7', name: 'Back Squat', category: 'Quads', icon: '🔥', sets: [], targetSets: 3, targetReps: 6, xpPerSet: 60 },
      { id: 'e8', name: 'Romanian Deadlift', category: 'Hamstrings', icon: '💀', sets: [], targetSets: 3, targetReps: 8, xpPerSet: 55 },
      { id: 'e9', name: 'Leg Press', category: 'Quads', icon: '⚡', sets: [], targetSets: 3, targetReps: 12, xpPerSet: 40 },
      { id: 'e10', name: 'Lunges', category: 'Glutes', icon: '🗡️', sets: [], targetSets: 3, targetReps: 10, xpPerSet: 35 },
      { id: 'e11', name: 'Calf Raises', category: 'Calves', icon: '🌑', sets: [], targetSets: 3, targetReps: 15, xpPerSet: 25 },
    ],
  },
  {
    name: 'Full Body Circuit',
    exercises: [
      { id: 'e12', name: 'Deadlift', category: 'Full Body', icon: '👑', sets: [], targetSets: 3, targetReps: 5, xpPerSet: 70 },
      { id: 'e13', name: 'Bench Press', category: 'Chest', icon: '⚔️', sets: [], targetSets: 3, targetReps: 8, xpPerSet: 40 },
      { id: 'e14', name: 'Pull-Ups', category: 'Back', icon: '🌑', sets: [], targetSets: 3, targetReps: 8, xpPerSet: 45 },
      { id: 'e15', name: 'Overhead Press', category: 'Shoulders', icon: '🛡️', sets: [], targetSets: 3, targetReps: 8, xpPerSet: 40 },
      { id: 'e16', name: 'Barbell Row', category: 'Back', icon: '⚡', sets: [], targetSets: 3, targetReps: 8, xpPerSet: 45 },
    ],
  },
];
