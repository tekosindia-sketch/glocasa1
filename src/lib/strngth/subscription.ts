export type PlanName = 'free' | '1month' | '6month' | 'lifetime';

export interface SubscriptionData {
  isPremium: boolean;
  planName: PlanName;
  subscriptionExpiry: string | null; // ISO 8601; null = no expiry set
  activatedAt: string | null;
}

export const DEFAULT_SUBSCRIPTION: SubscriptionData = {
  isPremium: false,
  planName: 'free',
  subscriptionExpiry: null,
  activatedAt: null,
};

/**
 * Authoritative premium check:
 *   1. Admin must have set isPremium = true
 *   2. Plan must not be 'free'
 *   3. Plan is 'lifetime'  →  always valid (no expiry needed)
 *      Plan has no expiry set  →  trusted (admin simply hasn't set one yet)
 *      Plan has expiry  →  must be in the future
 */
export function deriveIsPremium(sub: SubscriptionData | null | undefined): boolean {
  if (!sub || !sub.isPremium || sub.planName === 'free') return false;
  if (sub.planName === 'lifetime') return true;
  // No expiry stored yet — trust the admin's isPremium flag.
  if (!sub.subscriptionExpiry) return true;
  const expiry = new Date(sub.subscriptionExpiry);
  // If the date is invalid, treat as still valid (malformed ≠ expired).
  if (isNaN(expiry.getTime())) return true;
  return Date.now() < expiry.getTime();
}

export const PLAN_LABELS: Record<PlanName, string> = {
  free: 'Free',
  '1month': '1 Month',
  '6month': '6 Months',
  lifetime: 'Lifetime',
};

export const PLAN_COLORS: Record<PlanName, string> = {
  free: '#6b7280',
  '1month': '#00d4ff',
  '6month': '#7c3aed',
  lifetime: '#f59e0b',
};

export const PLAN_ICONS: Record<PlanName, string> = {
  free: '🔒',
  '1month': '⚡',
  '6month': '👑',
  lifetime: '∞',
};
