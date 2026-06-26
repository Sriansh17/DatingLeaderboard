// Scoring types and helpers are now unified in src/lib/scoring.ts.
// Re-exports keep existing imports from mock-data working during migration.
export {
  type Tier,
  type TierInfo,
  tierForScore,
  tierInfoForScore,
  scoreColor,
} from '@/lib/scoring';

import { TIER_EMOJI } from '@/lib/scoring';
import type { Tier, TierInfo } from '@/lib/scoring';

/** @deprecated Use TIER_EMOJI from '@/lib/scoring' instead. */
export const TIER_MAP: Record<Tier, TierInfo> = Object.fromEntries(
  Object.entries(TIER_EMOJI).map(([name, emoji]) => [name, { name: name as Tier, emoji }])
) as Record<Tier, TierInfo>;

export interface Story {
  id: string;
  username: string;
  partnerNickname: string;
  city: string;
  country: string;
  headline: string;
  score: number;
  verdict: string;
  explanationStr?: string | null;
  reactions: { heart: number; fire: number; laugh: number; trophy: number };
  believable: number;
  sus: number;
  suspectedFabrication?: boolean;
  postedAt: string;
  // Avatar URLs for the dual lockup
  userAvatarUrl?: string | null;
  partnerAvatarUrl?: string | null;
}

export const stories: Story[] = [
  {
    id: "1",
    username: "@rose_and_rayan",
    partnerNickname: "Rayan",
    city: "Mumbai",
    country: "India",
    headline: "He drove 40 minutes through monsoon traffic for the right boba flavor.",
    score: 91.3,
    verdict: "A man who navigates Mumbai rain for taro milk tea. Rare specimen.",
    reactions: { heart: 1240, fire: 320, laugh: 88, trophy: 412 },
    believable: 892,
    sus: 31,
    postedAt: "2h",
  },
  {
    id: "2",
    username: "@sunflower_couple",
    partnerNickname: "babe",
    city: "Bangalore",
    country: "India",
    headline: "She remembered I hate cilantro three years later at a new restaurant.",
    score: 88.6,
    verdict: "Unprecedented acts of culinary vigilance. The bar has been raised.",
    reactions: { heart: 980, fire: 210, laugh: 44, trophy: 301 },
    believable: 712,
    sus: 22,
    postedAt: "5h",
  },
  {
    id: "3",
    username: "@miafromqueens",
    partnerNickname: "my person",
    city: "New York",
    country: "USA",
    headline: "He hand-wrote a 12-page letter for our anniversary. Cursive. Sealed with wax.",
    score: 96.1,
    verdict: "Did this man time-travel from 1847 to humble the rest of us? Investigating.",
    reactions: { heart: 4210, fire: 1820, laugh: 612, trophy: 2103 },
    believable: 1402,
    sus: 612,
    suspectedFabrication: true,
    postedAt: "1d",
  },
  {
    id: "4",
    username: "@thomas.k",
    partnerNickname: "husband",
    city: "Berlin",
    country: "Germany",
    headline: "He microwaved my coffee instead of making a fresh one this morning.",
    score: 41.2,
    verdict: "Aggressively mediocre. The bar was on the floor and he limbo'd under it.",
    reactions: { heart: 88, fire: 12, laugh: 2104, trophy: 9 },
    believable: 980,
    sus: 14,
    postedAt: "8h",
  },
  {
    id: "5",
    username: "@karim_paris",
    partnerNickname: "mon amour",
    city: "Paris",
    country: "France",
    headline: "She learned guitar in secret for 6 months to play me one song.",
    score: 94.8,
    verdict: "Six months of stealth chord progressions. This is not love, this is a heist movie.",
    reactions: { heart: 3120, fire: 1100, laugh: 88, trophy: 1480 },
    believable: 1102,
    sus: 88,
    postedAt: "12h",
  },
];

export interface LeaderboardEntry {
  rank: number;
  username: string;
  partnerNickname: string;
  city: string;
  country: string;
  score: number;
  change: number;
}

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "@miafromqueens", partnerNickname: "my person", city: "New York", country: "USA", score: 96.1, change: 2 },
  { rank: 2, username: "@karim_paris", partnerNickname: "mon amour", city: "Paris", country: "France", score: 94.8, change: -1 },
  { rank: 3, username: "@oslo.lovers", partnerNickname: "kjæreste", city: "Oslo", country: "Norway", score: 93.4, change: 5 },
  { rank: 4, username: "@rose_and_rayan", partnerNickname: "Rayan", city: "Mumbai", country: "India", score: 91.3, change: 1 },
  { rank: 5, username: "@tokyo_two", partnerNickname: "ai", city: "Tokyo", country: "Japan", score: 90.7, change: 0 },
  { rank: 6, username: "@sunflower_couple", partnerNickname: "babe", city: "Bangalore", country: "India", score: 88.6, change: 3 },
  { rank: 7, username: "@cairo_hearts", partnerNickname: "habibi", city: "Cairo", country: "Egypt", score: 87.9, change: -2 },
  { rank: 8, username: "@melbourne.m", partnerNickname: "love", city: "Melbourne", country: "Australia", score: 86.2, change: 4 },
  { rank: 9, username: "@cdmx_dos", partnerNickname: "mi vida", city: "Mexico City", country: "Mexico", score: 85.4, change: -3 },
  { rank: 10, username: "@seoul_pair", partnerNickname: "자기", city: "Seoul", country: "South Korea", score: 84.1, change: 1 },
];

export const currentUser = {
  username: "@you",
  partnerNickname: "babe",
  city: "Lisbon",
  country: "Portugal",
  globalRank: 847,
  cityRank: 4,
  bestScore: 78.2,
  streak: 6,
  posts: 11,
  tier: "Certified Partner Material" as Tier,
};

export const tickerItems = [
  "847 stories scored today",
  "#1 in Mumbai: @rose_and_rayan",
  "Latest score: 88.6 — Unprecedented acts of coffee procurement",
  "12,402 couples ranked globally",
  "New legend in Paris: @karim_paris just hit 94.8",
  "Busted: 3 fabrications detected in the last hour",
];
