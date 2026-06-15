import {
  doc, getDoc, setDoc, onSnapshot, collection, addDoc,
  query, orderBy, limit, getDocs, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './firebase';
import { WorkoutHistory } from './types';
import { CloudState, SyncableState, UserDoc, stateToUserDoc, userDocToState, MOCK_PR_DATES } from './userData';

const userRef = (uid: string) => doc(db, 'users', uid);
const sessionsRef = (uid: string) => collection(db, 'users', uid, 'workoutSessions');

function initials(name: string): string {
  const fromWords = name.replace(/[^a-zA-Z ]/g, '').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return fromWords || name.slice(0, 2).toUpperCase();
}

function isOffline(e: unknown): boolean {
  const err = e as { name?: string; code?: string } | null;
  return !!(err && (err.name === 'AbortError' || err.code === 'unavailable' || err.code === 'failed-precondition'));
}

/**
 * Create the starter document for a brand-new user (the user-creation flow).
 * Runs for every provider on first sign-in; no-op if the doc already exists.
 * Pre-login onboarding (and the Google display name) flow into the profile.
 */
export async function ensureUserDoc(uid: string, authUser: User, state: SyncableState): Promise<void> {
  try {
    const ref = userRef(uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return;

    const docData = stateToUserDoc(state);
    const enteredName = state.onboarding.name?.trim();
    if (!enteredName && (authUser.displayName || authUser.email)) {
      const name = authUser.displayName || authUser.email!.split('@')[0];
      docData.profile.username = name;
      docData.profile.avatarInitials = initials(name);
    }

    await setDoc(ref, {
      ...docData,
      subscription: {
        isPremium: false,
        planName: 'free',
        subscriptionExpiry: null,
        activatedAt: null,
      },
      meta: { createdAt: serverTimestamp(), updatedAt: serverTimestamp(), schemaVersion: 1 },
    });
  } catch (e) {
    if (!isOffline(e)) console.error('[strngth] ensureUserDoc failed', e);
  }
}

/**
 * One-time migration: remove hardcoded mock personal records from the
 * Firestore document if they are still present from the initial app build.
 * Runs once per login session; silently no-ops if already clean or offline.
 */
export async function cleanMockPRs(uid: string): Promise<void> {
  try {
    const ref = userRef(uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as Partial<UserDoc>;
    const prs = (data.profile?.personalRecords ?? []) as Array<{ date?: string }>;
    if (!prs.some(pr => MOCK_PR_DATES.has((pr.date ?? '').split('T')[0]))) return;
    const cleaned = prs.filter(pr => !MOCK_PR_DATES.has((pr.date ?? '').split('T')[0]));
    await setDoc(ref, { profile: { ...data.profile, personalRecords: cleaned } }, { merge: true });
  } catch (e) {
    if (!isOffline(e)) console.error('[strngth] cleanMockPRs failed', e);
  }
}

/**
 * One-time migration: if this user's Firestore doc still has the hardcoded
 * mock player stats (level 47, 78 250 XP, 247 workouts), reset them to
 * fresh-start values. Runs once per login; no-ops if already clean or offline.
 */
export async function cleanMockPlayerData(uid: string): Promise<void> {
  try {
    const ref = userRef(uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as Partial<UserDoc>;

    const isMock =
      data.profile?.totalXP === 78250 &&
      data.progress?.totalWorkouts === 247;
    if (!isMock) return;

    const MOCK_UNLOCKED_IDS = new Set(['b1', 'b2', 'b4', 'b5', 'b6', 'b9', 'b11', 'b12']);
    const cleanedBadges = (data.achievements?.badges ?? []).map(
      (b: { id: string; unlocked: boolean; unlockedAt: string | null }) =>
        MOCK_UNLOCKED_IDS.has(b.id) ? { ...b, unlocked: false, unlockedAt: null } : b,
    );

    await setDoc(ref, {
      profile: {
        ...data.profile,
        level: 1,
        totalXP: 0,
        rank: 'E',
        auraColor: '#6b7280',
        title: 'Novice Hunter',
        personalRecords: [],
      },
      streaks: { current: 0, longest: 0, lastWorkoutDate: null },
      progress: { totalWorkouts: 0, totalVolume: 0 },
      achievements: { badges: cleanedBadges },
    }, { merge: true });
  } catch (e) {
    if (!isOffline(e)) console.error('[strngth] cleanMockPlayerData failed', e);
  }
}

/** Real-time listener on the user doc — drives cross-device sync. */
export function subscribeUser(uid: string, cb: (state: CloudState) => void) {
  return onSnapshot(
    userRef(uid),
    snap => { if (snap.exists()) cb(userDocToState(snap.data() as Partial<UserDoc>)); },
    err => { if (!isOffline(err)) console.error('[strngth] subscribeUser error', err); },
  );
}

// ── Debounced write: coalesce rapid store changes into one Firestore write ──
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingUid: string | null = null;
let pendingState: SyncableState | null = null;

async function flush() {
  pushTimer = null;
  const uid = pendingUid;
  const st = pendingState;
  pendingState = null;
  if (!uid || !st) return;
  try {
    await setDoc(
      userRef(uid),
      { ...stateToUserDoc(st), meta: { updatedAt: serverTimestamp(), schemaVersion: 1 } },
      { merge: true },
    );
  } catch (e) {
    if ((e as { name?: string })?.name === 'AbortError') return;
    console.error('[strngth] pushUserDoc failed', e);
  }
}

/** Queue a debounced (~800ms) write of the user doc. */
export function pushUserDoc(uid: string, state: SyncableState) {
  pendingUid = uid;
  pendingState = state;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(flush, 800);
}

/** Append a completed workout to the user's workoutSessions subcollection. */
export async function addSession(uid: string, session: WorkoutHistory): Promise<void> {
  try {
    await addDoc(sessionsRef(uid), {
      planName: session.planName,
      date: Timestamp.fromDate(new Date(session.date)),
      duration: session.duration,
      totalVolume: session.totalVolume,
      xpGained: session.xpGained,
      exercises: session.exercises,
      totalSets: session.totalSets,
      exerciseLogs: session.exerciseLogs ?? [],
      note: session.note ?? null,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    if ((e as { name?: string })?.name === 'AbortError') return;
    console.error('[strngth] addSession failed', e);
  }
}

/** Load the most recent workout sessions (newest first) into WorkoutHistory shape. */
export async function loadRecentSessions(uid: string, n = 20): Promise<WorkoutHistory[]> {
  try {
    const q = query(sessionsRef(uid), orderBy('date', 'desc'), limit(n));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      const ts = data.date as Timestamp | undefined;
      return {
        id: d.id,
        planName: data.planName,
        date: ts ? ts.toDate().toISOString() : new Date().toISOString(),
        duration: data.duration,
        totalVolume: data.totalVolume,
        xpGained: data.xpGained,
        exercises: data.exercises,
        totalSets: data.totalSets,
        exerciseLogs: data.exerciseLogs ?? [],
        ...(data.note ? { note: data.note } : {}),
      } as WorkoutHistory;
    });
  } catch (e) {
    if ((e as { name?: string })?.name === 'AbortError') return [];
    console.error('[strngth] loadRecentSessions failed', e);
    return [];
  }
}
