import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActiveWorkout, Badge, Exercise, ExerciseLog, FeedItem, GymNotification, LeaderboardEntry, LevelUpData, PersonalRecord, Player, ProgramExercise, Quest, UserProgram, WorkoutHistory, XPGain } from './types';
import { DEFAULT_WORKOUT_PLANS, MOCK_BADGES, MOCK_DAILY_QUESTS, MOCK_FEED, MOCK_LEADERBOARD, MOCK_NOTIFICATIONS, MOCK_PLAYER, MOCK_WEEKLY_QUESTS, MOCK_WORKOUT_HISTORY } from './data';
import { getLevelFromXP, getRankFromXP, isRankHigher } from './utils';
import { computeQuestProgress } from './questMetrics';
import type { CloudState } from './userData';
import { type SubscriptionData, DEFAULT_SUBSCRIPTION } from './subscription';

export interface NotifSettings {
  workoutReminders: boolean;
  questAlerts: boolean;
  xpMilestones: boolean;
  streakWarnings: boolean;
  socialActivity: boolean;
}

export interface PrivacySettings {
  publicProfile: boolean;
  showOnLeaderboard: boolean;
  shareWorkoutActivity: boolean;
}

export type Experience = 'never' | 'beginner' | 'intermediate' | 'advanced';
export type FitnessGoal = 'stronger' | 'muscle' | 'consistent' | 'lose' | 'ranks';
export type Gender = 'male' | 'female';

export interface OnboardingData {
  name: string;
  experience: Experience | null;
  goal: FitnessGoal | null;
  gender: Gender | null;
  age: number;
  weight: number; // stored in kg
  unit: 'kg' | 'lbs';
  workoutDuration: number; // minutes
}

export const DEFAULT_ONBOARDING: OnboardingData = {
  name: '',
  experience: null,
  goal: null,
  gender: null,
  age: 19,
  weight: 75,
  unit: 'kg',
  workoutDuration: 45,
};

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  stronger: 'Becoming Stronger',
  muscle: 'Building Muscle',
  consistent: 'Staying Consistent',
  lose: 'Losing Weight',
  ranks: 'Climbing Ranks',
};

interface StrngthState {
  player: Player;
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  badges: Badge[];
  workoutHistory: WorkoutHistory[];
  activeWorkout: ActiveWorkout | null;
  leaderboard: LeaderboardEntry[];
  socialFeed: FeedItem[];
  xpGains: XPGain[];
  showLevelUpOverlay: boolean;
  levelUpData: LevelUpData | null;
  calendarOpen: boolean;
  selectedDate: string | null;
  notifications: GymNotification[];
  notificationsOpen: boolean;
  notificationSettings: NotifSettings;
  privacySettings: PrivacySettings;
  programs: UserProgram[];
  theme: 'dark' | 'light';
  hasHydrated: boolean;
  onboarded: boolean;
  onboarding: OnboardingData;
  cloudLoaded: boolean;
  lastSession: WorkoutHistory | null;
  lastCheckInDate: string | null;
  questsDate: string;
  membershipPlan: '1month' | '6month' | 'lifetime' | null;
  subscription: SubscriptionData;

  setHasHydrated: (v: boolean) => void;
  setSubscription: (sub: SubscriptionData) => void;
  setOnboarding: (patch: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  logout: () => void;
  hydrateFromCloud: (partial: CloudState) => void;
  resetToDefaults: () => void;
  syncQuests: () => void;
  claimDailyCheckIn: () => void;
  setMembershipPlan: (plan: '1month' | '6month' | 'lifetime' | null) => void;
  gainXP: (amount: number, source: string) => void;
  saveProgram: (name: string, exercises: ProgramExercise[]) => void;
  deleteProgram: (id: string) => void;
  updatePlayer: (updates: Partial<Pick<Player, 'username' | 'avatarInitials'>>) => void;
  updateNotificationSettings: (updates: Partial<NotifSettings>) => void;
  updatePrivacySettings: (updates: Partial<PrivacySettings>) => void;
  completeQuest: (questId: string) => void;
  updateQuestProgress: (questId: string, progress: number) => void;
  startWorkout: (planIndex: number) => void;
  startCustomWorkout: (exercises: { id: string; name: string; category: string; targetSets: number; targetReps: number; xpPerSet: number }[], planName?: string) => void;
  addExercisesToWorkout: (exercises: { id: string; name: string; category: string; targetSets: number; targetReps: number; xpPerSet: number }[]) => void;
  logSet: (exerciseId: string, reps: number, weight: number) => void;
  completeAllSetsForExercise: (exerciseId: string) => void;
  endWorkout: () => void;
  setWorkoutNote: (note: string) => void;
  discardWorkout: () => void;
  startRestTimer: (seconds: number) => void;
  tickRestTimer: () => void;
  dismissLevelUp: () => void;
  removeXPGain: (id: string) => void;
  toggleLikeFeed: (itemId: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setAuraColor: (color: string) => void;
  openCalendar: () => void;
  closeCalendar: () => void;
  selectDate: (date: string | null) => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useStrngthStore = create<StrngthState>()(
  persist(
    (set, get) => ({
      player: MOCK_PLAYER,
      dailyQuests: MOCK_DAILY_QUESTS,
      weeklyQuests: MOCK_WEEKLY_QUESTS,
      badges: MOCK_BADGES,
      workoutHistory: MOCK_WORKOUT_HISTORY,
      activeWorkout: null,
      leaderboard: MOCK_LEADERBOARD,
      socialFeed: MOCK_FEED,
      xpGains: [],
      showLevelUpOverlay: false,
      levelUpData: null,
      calendarOpen: false,
      selectedDate: null,
      notifications: MOCK_NOTIFICATIONS,
      notificationsOpen: false,
      notificationSettings: {
        workoutReminders: true,
        questAlerts: true,
        xpMilestones: true,
        streakWarnings: true,
        socialActivity: false,
      },
      privacySettings: {
        publicProfile: true,
        showOnLeaderboard: true,
        shareWorkoutActivity: true,
      },
      programs: [],
      theme: 'dark' as 'dark' | 'light',
      hasHydrated: false,
      onboarded: false,
      onboarding: DEFAULT_ONBOARDING,
      cloudLoaded: false,
      lastSession: null,
      lastCheckInDate: null,
      questsDate: new Date().toISOString().split('T')[0],
      membershipPlan: null,
      subscription: DEFAULT_SUBSCRIPTION,

      setHasHydrated: (v) => set({ hasHydrated: v }),
      setSubscription: (sub) => set({ subscription: sub }),

      // Merge the user's Firestore data into the store (cross-device sync).
      hydrateFromCloud: (partial) => set(state => ({
        player: partial.player ? { ...state.player, ...partial.player } : state.player,
        badges: partial.badges ?? state.badges,
        dailyQuests: partial.dailyQuests ?? state.dailyQuests,
        weeklyQuests: partial.weeklyQuests ?? state.weeklyQuests,
        notificationSettings: partial.notificationSettings ?? state.notificationSettings,
        privacySettings: partial.privacySettings ?? state.privacySettings,
        programs: partial.programs ?? state.programs,
        theme: partial.theme ?? state.theme,
        onboarded: typeof partial.onboarded === 'boolean' ? partial.onboarded : state.onboarded,
        onboarding: partial.onboarding ?? state.onboarding,
        subscription: partial.subscription ?? state.subscription,
        cloudLoaded: true,
      })),

      // Wipe in-memory user data on logout / account switch (no cross-user leak).
      resetToDefaults: () => set({
        player: MOCK_PLAYER,
        badges: MOCK_BADGES,
        dailyQuests: MOCK_DAILY_QUESTS,
        weeklyQuests: MOCK_WEEKLY_QUESTS,
        workoutHistory: [],
        programs: [],
        notificationSettings: { workoutReminders: true, questAlerts: true, xpMilestones: true, streakWarnings: true, socialActivity: false },
        privacySettings: { publicProfile: true, showOnLeaderboard: true, shareWorkoutActivity: true },
        theme: 'dark',
        onboarded: false,
        onboarding: DEFAULT_ONBOARDING,
        activeWorkout: null,
        lastSession: null,
        cloudLoaded: false,
        lastCheckInDate: null,
        questsDate: new Date().toISOString().split('T')[0],
        membershipPlan: null,
        subscription: DEFAULT_SUBSCRIPTION,
      }),

      setOnboarding: (patch) => set(state => ({ onboarding: { ...state.onboarding, ...patch } })),

      // Sign out: keep the user's data, but require auth again (gate → Sign In).
      logout: () => set({ onboarded: false }),

      completeOnboarding: () => set(state => {
        const name = state.onboarding.name.trim();
        const initials = name
          ? name.replace(/[^a-zA-Z ]/g, '').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || name.slice(0, 2).toUpperCase()
          : state.player.avatarInitials;
        const goal = state.onboarding.goal;
        return {
          onboarded: true,
          player: {
            ...state.player,
            username: name || state.player.username,
            avatarInitials: initials,
            title: goal ? GOAL_LABELS[goal] : state.player.title,
          },
        };
      }),

      // Recompute live quest progress from real workout data.
      // Also resets daily quests when the calendar day rolls over.
      // completeQuest (claim) is intentionally separate — progress reaching
      // target doesn't auto-claim; the user taps CLAIM to collect the XP.
      syncQuests: () => {
        const today = new Date().toISOString().split('T')[0];
        const current = get();
        // If it's a new calendar day, reset daily quests to fresh state.
        let startingDaily = current.dailyQuests;
        if (!current.questsDate || current.questsDate !== today) {
          startingDaily = MOCK_DAILY_QUESTS.map(q => ({
            ...q,
            progress: 0,
            completed: false,
            expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
          }));
        }
        const { workoutHistory, activeWorkout, player } = current;
        const recompute = (q: Quest): Quest =>
          q.metric ? { ...q, progress: computeQuestProgress(q, workoutHistory, activeWorkout, player) } : q;
        set({
          questsDate: today,
          dailyQuests: startingDaily.map(recompute),
          weeklyQuests: current.weeklyQuests.map(recompute),
        });
      },

      setMembershipPlan: (plan) => set({ membershipPlan: plan }),

      // Award 50 XP once per calendar day.
      claimDailyCheckIn: () => {
        const today = new Date().toISOString().split('T')[0];
        if (get().lastCheckInDate === today) return;
        get().gainXP(50, 'Daily Check-in');
        set({ lastCheckInDate: today });
      },

      setTheme: (theme) => set({ theme }),

      saveProgram: (name, exercises) => {
        const program: UserProgram = {
          id: `prog-${Date.now()}`,
          name,
          exercises,
          createdAt: new Date().toISOString(),
        };
        set(state => ({ programs: [program, ...(state.programs ?? [])] }));
      },

      deleteProgram: (id) => set(state => ({
        programs: (state.programs ?? []).filter(p => p.id !== id),
      })),

      gainXP: (amount, source) => {
        const { player } = get();
        const prevLevel = getLevelFromXP(player.totalXP);
        const prevRank = getRankFromXP(player.totalXP);
        const newTotalXP = player.totalXP + amount;
        const newLevel = getLevelFromXP(newTotalXP);
        const newRank = getRankFromXP(newTotalXP);
        const leveledUp = newLevel > prevLevel;
        const rankedUp = isRankHigher(newRank, prevRank);

        const gain: XPGain = { id: `xp-${Date.now()}`, amount, source, timestamp: Date.now() };

        set(state => ({
          player: { ...state.player, totalXP: newTotalXP, level: newLevel, rank: newRank },
          xpGains: [...state.xpGains, gain].slice(-5),
          showLevelUpOverlay: leveledUp || rankedUp,
          levelUpData: leveledUp || rankedUp
            ? { newLevel, newRank: rankedUp ? newRank : undefined, previousRank: rankedUp ? prevRank : undefined }
            : state.levelUpData,
        }));

        // Also update leaderboard entry for current user
        set(state => ({
          leaderboard: state.leaderboard.map(e =>
            e.isCurrentUser ? { ...e, totalXP: newTotalXP, level: newLevel, playerRank: newRank } : e
          ),
        }));
      },

      completeQuest: (questId) => {
        const quest = [...get().dailyQuests, ...get().weeklyQuests].find(q => q.id === questId);
        // Only claimable once progress has actually reached the target.
        if (!quest || quest.completed || quest.progress < quest.target) return;
        get().gainXP(quest.xpReward, quest.title);
        set(state => ({
          dailyQuests: state.dailyQuests.map(q => q.id === questId ? { ...q, completed: true } : q),
          weeklyQuests: state.weeklyQuests.map(q => q.id === questId ? { ...q, completed: true } : q),
        }));
      },

      updateQuestProgress: (questId, progress) => {
        set(state => ({
          dailyQuests: state.dailyQuests.map(q => q.id === questId ? { ...q, progress } : q),
          weeklyQuests: state.weeklyQuests.map(q => q.id === questId ? { ...q, progress } : q),
        }));
      },

      startCustomWorkout: (exercises, planName = 'Custom Workout') => {
        set({
          activeWorkout: {
            id: `w-${Date.now()}`,
            planName,
            startedAt: Date.now(),
            exercises: exercises.map(e => ({
              id: e.id,
              name: e.name,
              category: e.category,
              icon: '💪',
              sets: Array.from({ length: e.targetSets }, () => ({ reps: 0, weight: 0, completed: false })),
              targetSets: e.targetSets,
              targetReps: e.targetReps,
              xpPerSet: e.xpPerSet,
            })),
            totalXPGained: 0,
            restTimerActive: false,
            restTimerSeconds: 0,
            restTimerMax: 90,
          },
        });
        get().syncQuests();
      },

      addExercisesToWorkout: (exercises) => {
        set(state => {
          if (!state.activeWorkout) return state;
          const existingIds = new Set(state.activeWorkout.exercises.map(e => e.id));
          const newExercises = exercises
            .filter(e => !existingIds.has(e.id))
            .map(e => ({
              id: e.id,
              name: e.name,
              category: e.category,
              icon: '💪',
              sets: Array.from({ length: e.targetSets }, () => ({ reps: 0, weight: 0, completed: false })),
              targetSets: e.targetSets,
              targetReps: e.targetReps,
              xpPerSet: e.xpPerSet,
            }));
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: [...state.activeWorkout.exercises, ...newExercises],
            },
          };
        });
        get().syncQuests();
      },

      startWorkout: (planIndex) => {
        const plan = DEFAULT_WORKOUT_PLANS[planIndex];
        const exercises: Exercise[] = plan.exercises.map(e => ({
          ...e,
          sets: Array.from({ length: e.targetSets }, () => ({ reps: 0, weight: 0, completed: false })),
        }));
        set({
          activeWorkout: {
            id: `w-${Date.now()}`,
            planName: plan.name,
            startedAt: Date.now(),
            exercises,
            totalXPGained: 0,
            restTimerActive: false,
            restTimerSeconds: 0,
            restTimerMax: 90,
          },
        });
        get().syncQuests();
      },

      logSet: (exerciseId, reps, weight) => {
        set(state => {
          if (!state.activeWorkout) return state;
          const exercises = state.activeWorkout.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;
            const nextIncomplete = ex.sets.findIndex(s => !s.completed);
            if (nextIncomplete === -1) return ex;
            const newSets = ex.sets.map((s, i) =>
              i === nextIncomplete ? { reps, weight, completed: true } : s
            );
            return { ...ex, sets: newSets };
          });
          const xpGained = weight > 0 ? 40 : 30;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises,
              totalXPGained: state.activeWorkout.totalXPGained + xpGained,
              restTimerActive: true,
              restTimerSeconds: 90,
              restTimerMax: 90,
            },
          };
        });
        get().gainXP(weight > 0 ? 40 : 30, 'Set Complete');
        get().syncQuests();
      },

      endWorkout: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const duration = Math.floor((Date.now() - activeWorkout.startedAt) / 1000);
        const totalVolume = activeWorkout.exercises.reduce((acc, ex) =>
          acc + ex.sets.filter(s => s.completed).reduce((a, s) => a + s.reps * s.weight, 0), 0);
        const totalSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
        const exerciseLogs: ExerciseLog[] = activeWorkout.exercises.map(ex => ({
          exerciseId: ex.id,
          name: ex.name,
          sets: ex.sets.filter(s => s.completed).map(s => ({ kg: s.weight, reps: s.reps })),
        }));
        const history: WorkoutHistory = {
          id: activeWorkout.id,
          planName: activeWorkout.planName,
          date: new Date().toISOString(),
          duration,
          totalVolume,
          xpGained: activeWorkout.totalXPGained,
          exercises: activeWorkout.exercises.length,
          totalSets,
          exerciseLogs,
          ...(activeWorkout.note ? { note: activeWorkout.note } : {}),
        };
        const now = new Date();
        const player = get().player;

        // Personal records: best completed set per exercise this session.
        const sessionBest = new Map<string, { weight: number; reps: number }>();
        for (const ex of activeWorkout.exercises) {
          for (const s of ex.sets) {
            if (!s.completed || s.weight <= 0) continue;
            const cur = sessionBest.get(ex.name);
            if (!cur || s.weight > cur.weight || (s.weight === cur.weight && s.reps > cur.reps)) {
              sessionBest.set(ex.name, { weight: s.weight, reps: s.reps });
            }
          }
        }
        const records: PersonalRecord[] = player.personalRecords.map(r => ({ ...r }));
        const todayISO = now.toISOString();
        for (const [exercise, best] of sessionBest) {
          const existing = records.find(r => r.exercise === exercise);
          if (!existing) {
            records.push({ exercise, weight: best.weight, reps: best.reps, date: todayISO, unit: 'kg' });
          } else if (best.weight > existing.weight || (best.weight === existing.weight && best.reps > existing.reps)) {
            existing.weight = best.weight;
            existing.reps = best.reps;
            existing.date = todayISO;
          }
        }

        // Streak: continue if last workout was today/yesterday, else restart.
        const dayKey = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
        let newStreak = 1;
        if (player.lastWorkoutDate) {
          const last = dayKey(new Date(player.lastWorkoutDate));
          const today = dayKey(now);
          const dayDiff = Math.round((today - last) / 86400000);
          if (dayDiff === 0) newStreak = player.streak;          // already trained today
          else if (dayDiff === 1) newStreak = player.streak + 1; // consecutive day
        }

        set(state => ({
          activeWorkout: null,
          workoutHistory: [history, ...state.workoutHistory].slice(0, 20),
          lastSession: history,
          player: {
            ...state.player,
            totalWorkouts: state.player.totalWorkouts + 1,
            totalVolume: state.player.totalVolume + totalVolume,
            lastWorkoutDate: todayISO,
            personalRecords: records,
            streak: newStreak,
            longestStreak: Math.max(state.player.longestStreak ?? 0, newStreak),
          },
        }));
        get().syncQuests();
      },

      completeAllSetsForExercise: (exerciseId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const exercise = activeWorkout.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;
        const incompleteSets = exercise.sets.filter(s => !s.completed).length;
        const xpEarned = incompleteSets * exercise.xpPerSet;
        set(state => {
          if (!state.activeWorkout) return state;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              totalXPGained: state.activeWorkout.totalXPGained + xpEarned,
              exercises: state.activeWorkout.exercises.map(ex =>
                ex.id !== exerciseId ? ex : {
                  ...ex,
                  sets: ex.sets.map(s => ({ ...s, completed: true })),
                }
              ),
            },
          };
        });
        if (xpEarned > 0) get().gainXP(xpEarned, exercise.name);
        get().syncQuests();
      },

      setWorkoutNote: (note) => {
        set(state => ({
          activeWorkout: state.activeWorkout ? { ...state.activeWorkout, note } : null,
        }));
      },

      discardWorkout: () => { set({ activeWorkout: null }); get().syncQuests(); },

      startRestTimer: (seconds) => {
        set(state => ({
          activeWorkout: state.activeWorkout
            ? { ...state.activeWorkout, restTimerActive: true, restTimerSeconds: seconds, restTimerMax: seconds }
            : null,
        }));
      },

      tickRestTimer: () => {
        set(state => {
          if (!state.activeWorkout || !state.activeWorkout.restTimerActive) return state;
          const newSeconds = state.activeWorkout.restTimerSeconds - 1;
          return {
            activeWorkout: {
              ...state.activeWorkout,
              restTimerSeconds: Math.max(0, newSeconds),
              restTimerActive: newSeconds > 0,
            },
          };
        });
      },

      dismissLevelUp: () => set({ showLevelUpOverlay: false }),

      removeXPGain: (id) => set(state => ({ xpGains: state.xpGains.filter(g => g.id !== id) })),

      toggleLikeFeed: (itemId) => set(state => ({
        socialFeed: state.socialFeed.map(item =>
          item.id === itemId
            ? { ...item, liked: !item.liked, likes: item.liked ? item.likes - 1 : item.likes + 1 }
            : item
        ),
      })),

      setAuraColor: (color) => set(state => ({
        player: { ...state.player, auraColor: color },
      })),

      openCalendar: () => set({ calendarOpen: true }),
      closeCalendar: () => set({ calendarOpen: false, selectedDate: null }),
      selectDate: (date) => set({ selectedDate: date }),
      openNotifications: () => set({ notificationsOpen: true }),
      closeNotifications: () => set({ notificationsOpen: false }),
      markNotificationRead: (id) => set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      })),
      markAllNotificationsRead: () => set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      })),

      updatePlayer: (updates) => set(state => ({
        player: { ...state.player, ...updates },
      })),

      updateNotificationSettings: (updates) => set(state => ({
        notificationSettings: { ...state.notificationSettings, ...updates },
      })),

      updatePrivacySettings: (updates) => set(state => ({
        privacySettings: { ...state.privacySettings, ...updates },
      })),
    }),
    {
      name: 'strngth-state',
      skipHydration: true,
      // Bump when persisted quest definitions change shape. v1 introduced
      // metric-driven quests; older saves hold metric-less quests whose progress
      // can't be derived, so they're dropped here and replaced by code defaults.
      version: 3,
      migrate: (persisted, version) => {
        const p = persisted as Partial<StrngthState> | undefined;
        if (p && version < 1) {
          delete (p as Record<string, unknown>).dailyQuests;
          delete (p as Record<string, unknown>).weeklyQuests;
        }
        if (p && version < 2) {
          const MOCK_DATES = new Set([
            '2025-04-12', '2025-05-01', '2025-05-10',
            '2025-04-28', '2025-05-08', '2025-05-15',
          ]);
          if (p.player?.personalRecords) {
            p.player.personalRecords = p.player.personalRecords.filter(
              pr => !MOCK_DATES.has(pr.date?.split('T')[0] ?? '')
            );
          }
        }
        if (p && version < 3) {
          // Reset player stats if still at the shipped mock values (level 47, 78250 XP).
          // Real users who earned XP will have a different totalXP value and are preserved.
          const MOCK_XP = 78250;
          if (p.player && p.player.totalXP === MOCK_XP) {
            p.player = {
              ...p.player,
              level: 1, totalXP: 0, rank: 'E', streak: 0,
              totalWorkouts: 0, totalVolume: 0,
              lastWorkoutDate: null, auraColor: '#6b7280',
            };
          }
          // Drop hardcoded mock workout sessions (identified by their static IDs).
          const MOCK_WH_IDS = new Set(['wh1', 'wh2', 'wh3', 'wh4', 'wh5']);
          if (p.workoutHistory) {
            p.workoutHistory = (p.workoutHistory as { id: string }[]).filter(
              w => !MOCK_WH_IDS.has(w.id)
            ) as StrngthState['workoutHistory'];
          }
          // Reset any mock-pre-unlocked badges back to locked.
          const MOCK_UNLOCKED_IDS = new Set(['b1', 'b2', 'b4', 'b5', 'b6', 'b9', 'b11', 'b12']);
          if (p.badges) {
            p.badges = (p.badges as Badge[]).map(b =>
              MOCK_UNLOCKED_IDS.has(b.id) ? { ...b, unlocked: false, unlockedAt: null } : b
            );
          }
        }
        return p as StrngthState;
      },
      // Fired after persist.rehydrate() resolves (even when storage is empty).
      // Flipping this flag is what lets the UI start rendering persisted data —
      // gating on it guarantees the server HTML and the first client render
      // agree, avoiding hydration mismatches in the App Router.
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Correct persisted-but-stale quest progress against real history.
        state?.syncQuests();
      },
      partialize: (state) => ({ player: state.player, dailyQuests: state.dailyQuests, weeklyQuests: state.weeklyQuests, workoutHistory: state.workoutHistory, notificationSettings: state.notificationSettings, privacySettings: state.privacySettings, programs: state.programs, theme: state.theme, onboarded: state.onboarded, onboarding: state.onboarding, lastCheckInDate: state.lastCheckInDate, questsDate: state.questsDate, membershipPlan: state.membershipPlan }),
    }
  )
);
