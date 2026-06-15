'use client';
import { useEffect } from 'react';
import { useStrngthStore } from '@/lib/strngth/store';

export default function StrngthThemeWrapper({ className, children }: { className: string; children: React.ReactNode }) {
  const theme = useStrngthStore(s => s.theme);
  const hasHydrated = useStrngthStore(s => s.hasHydrated);

  useEffect(() => {
    // Load persisted state from localStorage. The App Router can run this
    // layout effect before inner page segments finish hydrating, so we must
    // not render persisted data until `hasHydrated` flips true — otherwise the
    // server HTML (mock/default state) won't match the client (localStorage).
    useStrngthStore.persist.rehydrate();
  }, []);

  return (
    <div className={className} data-theme={hasHydrated ? theme : 'dark'} suppressHydrationWarning>
      {/* Animated background grid (static — safe to render before hydration) */}
      <div className="fixed inset-0 gym-grid-bg pointer-events-none z-0" />

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #00d4ff, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }} />
      </div>

      {hasHydrated ? children : (
        <div className="relative z-10 flex min-h-dvh items-center justify-center">
          <div
            className="w-10 h-10 rounded-full animate-spin"
            style={{ border: '3px solid var(--gym-border)', borderTopColor: '#00d4ff' }}
          />
        </div>
      )}
    </div>
  );
}
