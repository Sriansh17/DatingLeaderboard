import { formatDistanceToNow, format as dateFormat } from 'date-fns';

/**
 * Format utilities.
 *
 * Score colour/tier helpers are now maintained in src/lib/scoring.ts (the
 * single source of truth). Re-exports are kept here for backward compat.
 */
export {
  getScoreColor,
  getScoreBgColor,
  scoreColor,
  tierForScore,
  tierInfoForScore,
} from '@/lib/scoring';
export type { Tier, TierInfo } from '@/lib/scoring';

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date, formatStr = 'MMM d, yyyy'): string {
  return dateFormat(new Date(date), formatStr);
}

export function formatScore(score: number): string {
  return `${score}/100`;
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}
