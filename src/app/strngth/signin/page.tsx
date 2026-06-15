'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/strngth/firebase';
import { useStrngthStore } from '@/lib/strngth/store';

const CYAN = '#00d4ff';

const LINKS = {
  terms: 'https://strngth.app/terms',
  privacy: 'https://strngth.app/privacy',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SETUP_HINT = 'Firebase isn’t configured yet — add your NEXT_PUBLIC_FIREBASE_* keys to .env.local and restart the dev server.';

/** Friendly text for Firebase Auth error codes. */
function authError(code: string): string {
  switch (code) {
    case 'auth/invalid-email': return 'That email address looks invalid.';
    case 'auth/missing-password': return 'Please enter your password.';
    case 'auth/weak-password': return 'Password should be at least 6 characters.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect email or password.';
    case 'auth/too-many-requests': return 'Too many attempts — please try again later.';
    case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked': return 'Popup blocked — allow popups and try again.';
    case 'auth/operation-not-allowed': return 'This sign-in method is disabled. Enable it in Firebase Authentication.';
    case 'auth/unauthorized-domain': return 'This domain isn’t authorized in Firebase Auth settings.';
    case 'auth/network-request-failed': return 'Network error — check your connection and try again.';
    default: return 'Something went wrong. Please try again.';
  }
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: CYAN }} className="underline-offset-2 hover:underline">
      {children}
    </a>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const completeOnboarding = useStrngthStore(s => s.completeOnboarding);
  const setOnboarding = useStrngthStore(s => s.setOnboarding);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState<'' | 'signin' | 'google'>('');

  const emailValid = EMAIL_RE.test(email);
  const pwValid = password.length >= 6;
  const canSubmit = emailValid && pwValid && !loading;

  function finishLogin() {
    completeOnboarding();
    router.replace('/strngth/plans');
  }

  // Email/password: create the account for a new email, otherwise sign in.
  async function onSignIn() {
    setTouched(true);
    if (!canSubmit) return;
    if (!isFirebaseConfigured) { setNotice(SETUP_HINT); return; }
    setLoading('signin');
    setNotice('');
    try {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (e) {
        const code = (e as { code?: string }).code;
        if (code === 'auth/email-already-in-use') {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          throw e;
        }
      }
      finishLogin();
    } catch (e) {
      if ((e as { name?: string }).name === 'AbortError') return;
      setLoading('');
      setNotice(authError((e as { code?: string }).code ?? ''));
    }
  }

  // Google via Firebase popup.
  async function handleGoogle() {
    if (loading) return;
    if (!isFirebaseConfigured) { setNotice(SETUP_HINT); return; }
    setLoading('google');
    setNotice('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.displayName) setOnboarding({ name: result.user.displayName });
      finishLogin();
    } catch (e) {
      if ((e as { name?: string }).name === 'AbortError') return;
      setLoading('');
      setNotice(authError((e as { code?: string }).code ?? ''));
    }
  }

  const fieldStyle = (invalid: boolean) =>
    ({
      background: 'var(--gym-surface-subtle)',
      border: `1px solid ${invalid ? 'rgba(239,68,68,0.6)' : 'var(--gym-border-2)'}`,
      color: 'var(--gym-text)',
      caretColor: CYAN,
    }) as const;

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-6 pb-8 max-w-lg mx-auto w-full">
      {/* Back */}
      <button onClick={() => router.push('/strngth/welcome')} aria-label="Back" className="w-8 h-8 flex items-center justify-center -ml-1 mb-5" style={{ color: 'var(--gym-text-dim)' }}>
        <ChevronLeft size={22} />
      </button>

      {/* Brand + heading */}
      <p className="text-[11px] font-black tracking-[0.3em] mb-1" style={{ color: CYAN }}>STRNGTH</p>
      <h1 className="text-4xl font-black mb-1" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
        Sign In
      </h1>
      <p className="text-sm mb-7" style={{ color: 'var(--gym-text-muted)' }}>Welcome back, hunter. Let&apos;s get to work.</p>

      <div className="space-y-3">
        {/* Email */}
        <div>
          <div className="relative">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gym-text-tertiary)' }} />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Email address"
              className="w-full h-14 pl-11 pr-4 rounded-2xl text-base outline-none"
              style={fieldStyle(touched && !emailValid && email.length > 0)}
            />
          </div>
          {touched && email.length > 0 && !emailValid && (
            <p className="text-[11px] mt-1.5 ml-1" style={{ color: '#ef4444' }}>Enter a valid email address</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gym-text-tertiary)' }} />
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Password"
              className="w-full h-14 pl-11 pr-12 rounded-2xl text-base outline-none"
              style={fieldStyle(touched && !pwValid && password.length > 0)}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--gym-text-tertiary)' }}
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {touched && password.length > 0 && !pwValid && (
            <p className="text-[11px] mt-1.5 ml-1" style={{ color: '#ef4444' }}>Password must be at least 6 characters</p>
          )}
        </div>
      </div>

      {/* Forgot password */}
      <div className="flex justify-end mt-3">
        <button onClick={() => setNotice('Password reset will be available soon.')} className="text-sm font-semibold" style={{ color: CYAN }}>
          Forgot password?
        </button>
      </div>

      {/* Notice */}
      <AnimatePresence>
        {notice && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs mt-4 rounded-xl px-3 py-2"
            style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Continue (email) */}
      <motion.button
        onClick={onSignIn}
        disabled={!!loading}
        whileTap={canSubmit ? { scale: 0.98 } : undefined}
        className="w-full py-4 rounded-2xl font-black text-base tracking-wide mt-5 flex items-center justify-center gap-2"
        style={
          canSubmit
            ? { background: CYAN, color: '#04141d', boxShadow: `0 0 24px ${CYAN}40`, border: `1.5px solid ${CYAN}`, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }
            : { background: `${CYAN}66`, color: '#04141d', border: `1.5px solid ${CYAN}66`, fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }
        }
      >
        {loading === 'signin' ? <Loader2 size={18} className="animate-spin" /> : 'Continue'}
      </motion.button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <span className="flex-1 h-px" style={{ background: 'var(--gym-border)' }} />
        <span className="text-xs" style={{ color: 'var(--gym-text-tertiary)' }}>or</span>
        <span className="flex-1 h-px" style={{ background: 'var(--gym-border)' }} />
      </div>

      {/* Google */}
      <motion.button
        onClick={handleGoogle}
        disabled={!!loading}
        whileTap={loading ? undefined : { scale: 0.98 }}
        className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3"
        style={{ background: `${CYAN}0d`, border: `1.5px solid ${CYAN}55`, color: 'var(--gym-text)' }}
      >
        {loading === 'google' ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.2-.1-2.3-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 16 3 9.1 7.6 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 36 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9 40.3 15.9 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.4 36.5 44 31 44 24c0-1.2-.1-2.3-.4-3.5z" />
            </svg>
            Continue with Google
          </>
        )}
      </motion.button>

      <div className="flex-1 min-h-6" />

      {/* Policy links */}
      <p className="text-center text-[11px] leading-relaxed mt-8" style={{ color: 'var(--gym-text-tertiary)' }}>
        By continuing, you agree to STRNGTH&apos;s{' '}
        <ExtLink href={LINKS.terms}>Terms of Service</ExtLink> and{' '}
        <ExtLink href={LINKS.privacy}>Privacy Policy</ExtLink>.
      </p>
    </div>
  );
}
