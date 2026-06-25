/**
 * Unified scoring module — single source of truth for score colors, tiers, and thresholds.
 *
 * Previously, score-to-color logic lived in format.ts and mock-data.ts with duplicated
 * thresholds, while tier labels in mock-data.ts used completely different breakpoints.
 * This module consolidates everything so colors and tier names are always in sync.
 */

// ── Color thresholds (4 bands) ────────────────────────────────────────
export const SCORE_THRESHOLDS = {
  LOW: 55,
  MID: 75,
  HIGH: 92,
} as const;

/** Tailwind text-color class for a score value. */
export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.HIGH) return 'text-score-legendary';
  if (score >= SCORE_THRESHOLDS.MID) return 'text-score-high';
  if (score >= SCORE_THRESHOLDS.LOW) return 'text-score-mid';
  return 'text-score-low';
}

/** Tailwind bg-color class for a score value. */
export function getScoreBgColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.HIGH) return 'bg-score-legendary';
  if (score >= SCORE_THRESHOLDS.MID) return 'bg-score-high';
  if (score >= SCORE_THRESHOLDS.LOW) return 'bg-score-mid';
  return 'bg-score-low';
}

/** RGB CSS color string (used for inline styles like charts). */
export function scoreColor(score: number): string {
  if (score < SCORE_THRESHOLDS.LOW) return 'rgb(var(--score-low))';
  if (score < SCORE_THRESHOLDS.MID) return 'rgb(var(--score-mid))';
  if (score < SCORE_THRESHOLDS.HIGH) return 'rgb(var(--score-high))';
  return 'rgb(var(--score-legendary))';
}

// ── Tier thresholds (8 tiers — richer than color bands) ───────────────
export const TIER_THRESHOLDS = [
  { max: 40,  name: 'Still Dating' },
  { max: 55,  name: "It's Complicated" },
  { max: 65,  name: 'Officially Exclusive' },
  { max: 75,  name: 'Relationship Goals' },
  { max: 85,  name: 'Certified Partner Material' },
  { max: 92,  name: 'Gold Standard' },
  { max: 97,  name: 'Legendary' },
  { max: Infinity, name: 'The Algorithm Has No Words' },
] as const;

export type Tier = (typeof TIER_THRESHOLDS)[number]['name'];

export const TIER_EMOJI: Record<Tier, string> = {
  'Still Dating':               '🥉',
  "It's Complicated":           '📉',
  'Officially Exclusive':       '📊',
  'Relationship Goals':         '⭐',
  'Certified Partner Material': '💎',
  'Gold Standard':              '🏆',
  'Legendary':                  '👑',
  'The Algorithm Has No Words': '🌟',
};

export interface TierInfo {
  name: Tier;
  emoji: string;
}

/** Return the tier label for a given score. */
export function tierForScore(score: number): Tier {
  for (const t of TIER_THRESHOLDS) {
    if (score < t.max) return t.name as Tier;
  }
  return 'The Algorithm Has No Words';
}

export function tierInfoForScore(score: number): TierInfo {
  const tier = tierForScore(score);
  return { name: tier, emoji: TIER_EMOJI[tier] };
}
