'use client';
import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/strngth/firebase';
import { useStrngthStore } from '@/lib/strngth/store';
import { SyncableState } from '@/lib/strngth/userData';
import { ensureUserDoc, subscribeUser, pushUserDoc, addSession, loadRecentSessions, cleanMockPRs, cleanMockPlayerData } from '@/lib/strngth/sync';

type State = ReturnType<typeof useStrngthStore.getState>;

/** The slices we mirror to Firestore (history lives in a subcollection, not here). */
function sliceOf(s: State): SyncableState {
  return {
    player: s.player,
    badges: s.badges,
    dailyQuests: s.dailyQuests,
    weeklyQuests: s.weeklyQuests,
    notificationSettings: s.notificationSettings,
    privacySettings: s.privacySettings,
    programs: s.programs,
    theme: s.theme,
    onboarded: s.onboarded,
    onboarding: s.onboarding,
  };
}

/**
 * Headless component: keeps Firestore and the Zustand store in sync per Auth UID.
 * - On sign-in: ensure starter doc, load history, subscribe (real-time) + push (debounced).
 * - On sign-out: detach + reset the store so no data leaks between users.
 */
export default function FirebaseSync() {
  const uidRef = useRef<string | null>(null);
  const unsubCloud = useRef<(() => void) | null>(null);
  const unsubStore = useRef<(() => void) | null>(null);
  const applyingCloud = useRef(false);
  const lastSlice = useRef('');
  const lastSessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const detach = () => {
      unsubCloud.current?.();
      unsubStore.current?.();
      unsubCloud.current = null;
      unsubStore.current = null;
      uidRef.current = null;
      lastSlice.current = '';
      lastSessionId.current = null;
    };

    const unsubAuth = onAuthStateChanged(auth, async user => {
      detach();

      if (!user) {
        useStrngthStore.getState().resetToDefaults();
        return;
      }

      uidRef.current = user.uid;

      try {
        // Create the starter doc if this UID is brand new (merges pre-login data).
        await ensureUserDoc(user.uid, user, sliceOf(useStrngthStore.getState()));
        if (uidRef.current !== user.uid) return;

        // One-time: reset mock player stats in Firestore (level 47, 247 workouts, etc.).
        await cleanMockPlayerData(user.uid);
        if (uidRef.current !== user.uid) return;

        // One-time: strip hardcoded mock PRs from Firestore if still present.
        await cleanMockPRs(user.uid);
        if (uidRef.current !== user.uid) return;

        // Load recent workout history from the subcollection.
        const sessions = await loadRecentSessions(user.uid);
        if (uidRef.current !== user.uid) return;
        useStrngthStore.setState({ workoutHistory: sessions });
        lastSessionId.current = sessions[0]?.id ?? null;
      } catch (e) {
        const err = e as { name?: string; code?: string };
        const isOffline = err?.name === 'AbortError' || err?.code === 'unavailable' || err?.code === 'failed-precondition';
        if (!isOffline) console.error('[strngth] user setup failed', e);
        return;
      }

      // Real-time: Firestore → store.
      unsubCloud.current = subscribeUser(user.uid, cloud => {
        applyingCloud.current = true;
        useStrngthStore.getState().hydrateFromCloud(cloud);
        applyingCloud.current = false;
      });

      // store → Firestore (debounced doc write + session appends).
      lastSlice.current = JSON.stringify(sliceOf(useStrngthStore.getState()));
      unsubStore.current = useStrngthStore.subscribe(state => {
        const uid = uidRef.current;
        if (!uid) return;

        // New completed workout → append a session doc.
        if (state.lastSession && state.lastSession.id !== lastSessionId.current) {
          lastSessionId.current = state.lastSession.id;
          addSession(uid, state.lastSession);
        }

        // Skip echo writes triggered by our own cloud hydrate.
        if (applyingCloud.current) return;
        const slice = sliceOf(state);
        const json = JSON.stringify(slice);
        if (json === lastSlice.current) return;
        lastSlice.current = json;
        pushUserDoc(uid, slice);
      });
    });

    return () => {
      unsubAuth();
      detach();
    };
  }, []);

  return null;
}
