import { Badge, Player, Quest, UserProgram } from './types';
import type { NotifSettings, PrivacySettings, OnboardingData } from './store';
import { MOCK_BADGES } from './data';
import { type SubscriptionData, type PlanName, DEFAULT_SUBSCRIPTION } from './subscription';

/** The persisted slices of the Zustand store that we mirror to Firestore. */
export interface SyncableState {
  player: Player;
  badges: Badge[];
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  notificationSettings: NotifSettings;
  privacySettings: PrivacySettings;
  programs: UserProgram[];
  theme: 'dark' | 'light';
  onboarded: boolean;
  onboarding: OnboardingData;
}

/** The clean Firestore shape for `users/{uid}` (excluding the `meta` block, which sync adds). */
export interface UserDoc {
  profile: {
    username: string;
    title: string;
    avatarInitials: string;
    auraColor: string;
    guild: string | null;
    level: number;
    totalXP: number;
    rank: Player['rank'];
    joinedDate: string;
    personalRecords: Player['personalRecords'];
  };
  streaks: { current: number; longest: number; lastWorkoutDate: string | null };
  progress: { totalWorkouts: number; totalVolume: number };
  settings: { theme: 'dark' | 'light'; notifications: NotifSettings; privacy: PrivacySettings };
  achievements: { badges: { id: string; unlocked: boolean; unlockedAt: string | null }[] };
  onboarding: OnboardingData;
  onboarded: boolean;
  quests: { daily: Quest[]; weekly: Quest[] };
  programs: UserProgram[];
  subscription?: {
    isPremium: boolean;
    planName: string;
    subscriptionExpiry: string | null;
    activatedAt: string | null;
  };
}

/** Partial store state hydrated back from a Firestore user doc. */
export interface CloudState {
  player?: Partial<Player>;
  badges?: Badge[];
  dailyQuests?: Quest[];
  weeklyQuests?: Quest[];
  notificationSettings?: NotifSettings;
  privacySettings?: PrivacySettings;
  programs?: UserProgram[];
  theme?: 'dark' | 'light';
  onboarded?: boolean;
  onboarding?: OnboardingData;
  subscription?: SubscriptionData;
}

/** Remove `undefined` recursively — Firestore rejects undefined values. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null));
}

/**
 * Convert a Firestore Timestamp, ISO string, or Unix ms number to an ISO string.
 * The Firestore console stores dates as Timestamp objects; after clean() they
 * become plain objects { seconds, nanoseconds }. Both forms are handled here
 * so deriveIsPremium can safely call new Date(isoString).
 */
function toISO(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val || null;
  if (typeof val === 'number') return new Date(val).toISOString();
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    // Live Firestore Timestamp with toDate() method
    if (typeof obj.toDate === 'function') {
      return (obj.toDate as () => Date)().toISOString();
    }
    // Plain object after JSON round-trip: { seconds: number, nanoseconds: number }
    if (typeof obj.seconds === 'number') {
      return new Date(obj.seconds * 1000 + Math.floor((obj.nanoseconds as number ?? 0) / 1e6)).toISOString();
    }
  }
  return null;
}

/** Build the Firestore document from the in-memory store state. */
export function stateToUserDoc(s: SyncableState): UserDoc {
  const p = s.player;
  return clean({
    profile: {
      username: p.username,
      title: p.title,
      avatarInitials: p.avatarInitials,
      auraColor: p.auraColor,
      guild: p.guild ?? null,
      level: p.level,
      totalXP: p.totalXP,
      rank: p.rank,
      joinedDate: p.joinedDate,
      personalRecords: p.personalRecords ?? [],
    },
    streaks: {
      current: p.streak,
      longest: Math.max(p.longestStreak ?? 0, p.streak),
      lastWorkoutDate: p.lastWorkoutDate ?? null,
    },
    progress: { totalWorkouts: p.totalWorkouts, totalVolume: p.totalVolume },
    settings: { theme: s.theme, notifications: s.notificationSettings, privacy: s.privacySettings },
    achievements: {
      badges: s.badges.map(b => ({ id: b.id, unlocked: b.unlocked, unlockedAt: b.unlockedAt ?? null })),
    },
    onboarding: s.onboarding,
    onboarded: s.onboarded,
    quests: { daily: s.dailyQuests, weekly: s.weeklyQuests },
    programs: s.programs,
  });
}

/** Merge stored badge unlock-state back onto the static badge definitions. */
function mergeBadges(saved?: UserDoc['achievements']['badges']): Badge[] {
  if (!saved?.length) return MOCK_BADGES;
  return MOCK_BADGES.map(def => {
    const s = saved.find(x => x.id === def.id);
    return s ? { ...def, unlocked: s.unlocked, unlockedAt: s.unlockedAt ?? def.unlockedAt } : def;
  });
}

// Dates of the hardcoded mock personal records that shipped with the initial
// app build. Used to strip them from both localStorage (via store migration)
// and Firestore (via userDocToState filtering + cleanMockPRs).
export const MOCK_PR_DATES = new Set([
  '2025-04-12', '2025-05-01', '2025-05-10',
  '2025-04-28', '2025-05-08', '2025-05-15',
]);

/** Translate a Firestore user doc back into store slices (undefined keys dropped). */
export function userDocToState(doc: Partial<UserDoc>): CloudState {
  const out: CloudState = {};

  if (doc.profile || doc.streaks || doc.progress) {
    const profile = doc.profile ?? {} as NonNullable<UserDoc['profile']>;
    // Strip any mock/demo PRs that were seeded in the initial app data.
    const cleanedPRs = (profile.personalRecords ?? []).filter(
      (pr: { date?: string }) => !MOCK_PR_DATES.has((pr.date ?? '').split('T')[0])
    );
    out.player = {
      ...profile,
      personalRecords: cleanedPRs,
      streak: doc.streaks?.current,
      longestStreak: doc.streaks?.longest,
      lastWorkoutDate: doc.streaks?.lastWorkoutDate ?? null,
      totalWorkouts: doc.progress?.totalWorkouts,
      totalVolume: doc.progress?.totalVolume,
    } as Partial<Player>;
  }
  if (doc.achievements) out.badges = mergeBadges(doc.achievements.badges);
  if (doc.quests) {
    out.dailyQuests = doc.quests.daily;
    out.weeklyQuests = doc.quests.weekly;
  }
  if (doc.settings) {
    out.theme = doc.settings.theme;
    out.notificationSettings = doc.settings.notifications;
    out.privacySettings = doc.settings.privacy;
  }
  if (doc.programs) out.programs = doc.programs;
  if (typeof doc.onboarded === 'boolean') out.onboarded = doc.onboarded;
  if (doc.onboarding) out.onboarding = doc.onboarding;
  if (doc.subscription) {
    out.subscription = {
      isPremium: Boolean(doc.subscription.isPremium),
      planName: (doc.subscription.planName as PlanName) || 'free',
      // Admin may store expiry as a Firestore Timestamp, ISO string, or null.
      // toISO() normalises all three so deriveIsPremium can safely compare dates.
      subscriptionExpiry: toISO(doc.subscription.subscriptionExpiry),
      activatedAt: toISO(doc.subscription.activatedAt),
    };
  } else {
    out.subscription = DEFAULT_SUBSCRIPTION;
  }

  return clean(out);
}
