import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Web config from your Firebase project (Project settings → Your apps → Web app).
// These NEXT_PUBLIC_* values are safe to expose in the client bundle.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True once the env vars are filled in — used to show a setup hint otherwise. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Only initialize when fully configured. Calling initializeApp / getAuth /
// getFirestore with missing credentials causes the Firebase SDK to immediately
// make network requests that fail with "Failed to fetch" / "client is offline"
// errors that flood the Next.js dev overlay.
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

if (isFirebaseConfigured) {
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  // getAuth and getFirestore are intentionally called only here — they both
  // establish backend connections on first call, which fails loudly with no config.
  _auth = getAuth(_app);
  _db = getFirestore(_app);
}

// All callers guard with isFirebaseConfigured before using these — safe to
// cast. When isFirebaseConfigured is false these are undefined at runtime but
// code paths that use them are never reached.
export const auth = _auth as Auth;
export const db = _db as Firestore;
export const googleProvider = new GoogleAuthProvider();

// Suppress benign Firebase/Firestore errors that flood the Next.js dev overlay:
//   • AbortError  — Firestore aborts in-flight requests on listener detach / HMR
//   • unavailable — Firestore can't reach backend (offline / project not set up)
if (typeof window !== 'undefined') {
  const w = window as unknown as { __strngthAbortGuard?: boolean };
  if (!w.__strngthAbortGuard) {
    w.__strngthAbortGuard = true;

    const isSuppressed = (v: unknown): boolean => {
      const e = v as { name?: string; code?: string; message?: string } | null | undefined;
      if (!e) return false;
      if (e.name === 'AbortError') return true;
      if (e.code === 'unavailable' || e.code === 'failed-precondition') return true;
      const msg = e.message ?? '';
      return /aborted a request/i.test(msg) || /client is offline/i.test(msg);
    };

    // Unhandled promise rejection (most common Firestore path).
    window.addEventListener('unhandledrejection', event => {
      if (isSuppressed(event.reason)) { event.preventDefault(); return; }
      // "Failed to fetch" thrown by browser extensions — not our code.
      const stack = (event.reason as { stack?: string })?.stack ?? '';
      const msg = (event.reason as { message?: string })?.message ?? '';
      if (/chrome-extension:\/\//i.test(stack) || /chrome-extension:\/\//i.test(msg)) {
        event.preventDefault();
      }
    });

    // Synchronous error event — intercept in capture phase before the
    // Next.js dev overlay listener so it never reaches the overlay.
    window.addEventListener('error', event => {
      if (isSuppressed(event.error) || /aborted a request/i.test(event.message ?? '')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    // Firestore SDK logs "Could not reach Cloud Firestore backend" via console.error.
    // The Next.js dev overlay intercepts console.error — filter those specific messages.
    const _origError = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      // Join all arguments — Firebase SDK passes a timestamp prefix in args[0]
      // and the actual error text in args[1], so checking only args[0] misses it.
      const msg = args.map(a => String(a ?? '')).join(' ');
      if (
        /Could not reach Cloud Firestore backend/i.test(msg) ||
        /Connection failed \d+ times/i.test(msg) ||
        /client is offline/i.test(msg) ||
        /\[code=unavailable\]/i.test(msg)
      ) return;
      _origError(...args);
    };
  }
}
