import { BADGES, PERKS, STREAK_MULTIPLIER_MAX, STREAK_MULTIPLIER_PER_DAY } from './constants';
import type { BadgeDef, PerkDef } from './constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StreakUpdate {
  newStreak: number;
  longestStreak: number;
  newBadges: BadgeDef[];
}

export interface DailyPerkResult {
  perk: PerkDef;
  fragmentCount: number;
  mysticUnlocked: boolean;
}

// ─── Public Helpers ───────────────────────────────────────────────────────────

/**
 * Calculate streak multiplier (1% per day, max 25%).
 * Returns 1.0 if no streak, up to 1.25 at max.
 */
export function streakMultiplier(streakCount: number): number {
  if (streakCount <= 0) return 1.0;
  const boost = Math.min(streakCount * STREAK_MULTIPLIER_PER_DAY, STREAK_MULTIPLIER_MAX);
  return 1 + boost / 100;
}

/**
 * Apply streak multiplier to a raw AI score.
 */
export function applyStreakBoost(rawScore: number, streakCount: number): number {
  const boosted = Math.round(rawScore * streakMultiplier(streakCount));
  return Math.min(boosted, 100);
}

/**
 * Given today's streak (after posting), determine which badges
 * the user has newly earned (not already owned).
 */
export function checkNewBadges(
  streakCount: number,
  ownedBadgeIds: string[]
): BadgeDef[] {
  return BADGES.filter(
    (badge) =>
      badge.streakRequired > 0 &&
      streakCount >= badge.streakRequired &&
      !ownedBadgeIds.includes(badge.id)
  );
}

/**
 * Pick a random mystery perk, avoiding recently-given ones.
 */
export function pickDailyPerk(alreadyCollected: string[]): PerkDef {
  // Filter out perks already collected today
  const available = PERKS.filter((p) => !alreadyCollected.includes(p.id));
  // If all collected today, just pick any
  const pool = available.length > 0 ? available : PERKS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Check if the user's last_post_date qualifies for a streak increment.
 * todayStr and lastStr are 'YYYY-MM-DD' strings.
 * Returns 'increment' | 'reset' | 'same-day' | 'first'.
 */
export function evaluateStreak(
  todayStr: string,
  lastPostStr: string | null
): 'increment' | 'reset' | 'same-day' | 'first' {
  if (!lastPostStr) return 'first';

  // Compare YYYY-MM-DD strings directly for same-day check (avoids timezone pitfalls)
  if (todayStr === lastPostStr) return 'same-day';

  // Parse at noon UTC to avoid time-of-day drift
  const today = new Date(todayStr + 'T12:00:00Z');
  const last = new Date(lastPostStr + 'T12:00:00Z');
  const diffMs = today.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'increment';
  return 'reset';
}
