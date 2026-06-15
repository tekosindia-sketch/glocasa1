'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useStrngthStore } from '@/lib/strngth/store';
import StrngthNav from '@/components/strngth/StrngthNav';
import TopBar from '@/components/strngth/TopBar';
import CalendarPanel from '@/components/strngth/CalendarPanel';
import NotificationPanel from '@/components/strngth/NotificationPanel';
import LevelUpOverlay from '@/components/strngth/ui/LevelUpOverlay';
import XPToastLayer from '@/components/strngth/ui/XPToastLayer';

const ONBOARDING_ROUTES = ['/strngth/welcome', '/strngth/onboarding', '/strngth/signin', '/strngth/plans'];

/**
 * Renders the dashboard chrome (nav, topbar, panels) for dashboard routes and
 * gates them behind onboarding. On onboarding routes it renders the children
 * full-bleed — no nav/topbar. Only mounts after the store has hydrated (via
 * StrngthThemeWrapper), so `onboarded` is reliable and there's no redirect flash.
 */
export default function StrngthChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onboarded = useStrngthStore(s => s.onboarded);
  const isOnboarding = ONBOARDING_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));

  useEffect(() => {
    if (!isOnboarding && !onboarded) {
      // Use window.location.replace instead of router.replace so the Next.js
      // router never calls AbortController.abort() on an in-flight RSC fetch,
      // which is the root cause of the "AbortError: The user aborted a request"
      // that shows up in the Turbopack dev overlay.
      window.location.replace('/strngth/welcome');
    }
  }, [isOnboarding, onboarded]);

  // Onboarding screens: full-bleed, no dashboard chrome.
  if (isOnboarding) {
    return <div className="relative z-10 min-h-dvh">{children}</div>;
  }

  // Block dashboard paint until the gate redirect resolves.
  if (!onboarded) return null;

  return (
    <>
      <div className="relative z-10 flex min-h-dvh">
        <StrngthNav />

        {/* Right side: TopBar + scrollable content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar />
          <main
            className="flex-1 overflow-y-auto"
            style={{ paddingTop: '64px', paddingBottom: '80px' }}
          >
            <div className="lg:pl-64">{children}</div>
          </main>
        </div>
      </div>

      {/* Global overlays */}
      <CalendarPanel />
      <NotificationPanel />
      <LevelUpOverlay />
      <XPToastLayer />
    </>
  );
}
