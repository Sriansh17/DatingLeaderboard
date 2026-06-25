import { formatDistanceToNow, format as dateFormat } from 'date-fns';

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date, formatStr = 'MMM d, yyyy'): string {
  return dateFormat(new Date(date), formatStr);
}

export function formatScore(score: number): string {
  return `${score}/100`;
}

export function getScoreColor(score: number): string {
  if (score >= 92) return 'text-score-legendary';
  if (score >= 75) return 'text-score-high';
  if (score >= 55) return 'text-score-mid';
  return 'text-score-low';
}

export function getScoreBgColor(score: number): string {
  if (score >= 92) return 'bg-score-legendary';
  if (score >= 75) return 'bg-score-high';
  if (score >= 55) return 'bg-score-mid';
  return 'bg-score-low';
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}
