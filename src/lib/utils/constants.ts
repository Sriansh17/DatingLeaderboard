export const APP_NAME = 'Fond';
export const APP_DESCRIPTION = 'Post one story. AI judges it. Compete with couples worldwide.';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  DASHBOARD: '/dashboard',
  POSTS: {
    NEW: '/posts/new',
    DETAIL: (id: string) => `/posts/${id}`,
    EDIT: (id: string) => `/posts/${id}/edit`,
  },
  PARTNERS: {
    LIST: '/partners',
    NEW: '/partners/new',
  },
  LEADERBOARDS: {
    HUB: '/leaderboards',
    LOCAL: '/leaderboards/local',
    CITY: '/leaderboards/city',
    GLOBAL: '/leaderboards/global',
  },
  PROFILE: {
    VIEW: '/profile',
    EDIT: '/profile/edit',
  },
  SETTINGS: '/settings',
  PREMIUM: '/premium',
  NOTIFICATIONS: '/notifications',
  USERS: {
    DETAIL: (id: string) => `/users/${id}`,
  },
} as const;

export const MIN_POSTS_FOR_LEADERBOARD = 1;
export const LEADERBOARD_PAGE_SIZE = 50;
export const LOCAL_RADIUS_KM = 10;
export const POSTS_PER_PAGE = 20;
export const SCORE_ANIMATION_DURATION = 1500; // ms
export const EXPLORE_FEED_LIMIT = 50;
export const CIRCLE_FEED_LIMIT = 50;

// ─── Notifications ───────────────────────────────────────────────────────────────────
export const NOTIFICATION_POLL_INTERVAL = 30000; // 30s

// ─── Subscription Plans ────────────────────────────────────────────────────────────

export interface PlanDefinition {
  id: string;
  name: string;
  price: number;       // in paise for Razorpay
  priceDisplay: string;
  currency: string;
  period: string;
  features: string[];
  popular: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, PlanDefinition> = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: '₹0',
    currency: 'INR',
    period: '',
    features: [
      '2 posts per day',
      '1 partner max',
      'Basic leaderboard access',
      'Connect with others',
    ],
    popular: false,
  },
  PREMIUM_MONTHLY: {
    id: 'premium_monthly',
    name: 'Premium',
    price: 29900,  // ₹299 in paise
    priceDisplay: '₹299',
    currency: 'INR',
    period: '/month',
    features: [
      'Unlimited daily posts',
      'Unlimited partners',
      'Edit your posts',
      'Extended profile viewing',
      'Priority support',
      'Ad-free experience',
    ],
    popular: true,
  },
  PREMIUM_YEARLY: {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 249900,  // ₹2,499 in paise
    priceDisplay: '₹2,499',
    currency: 'INR',
    period: '/year',
    features: [
      'Everything in Premium',
      '2 months free (₹2,499/yr vs ₹3,588/yr)',
      'Streak freeze (1/month)',
      'Early access to new features',
      'Exclusive badge',
    ],
    popular: false,
  },
} as const;

// ─── Daily Engagement System ─────────────────────────────────────────────────────────

export const STREAK_MULTIPLIER_MAX = 25;   // +25% max score boost
export const STREAK_MULTIPLIER_PER_DAY = 1; // +1% per consecutive day

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  streakRequired: number;
}

export const BADGES: BadgeDef[] = [
  { id: 'budding_rose',    name: 'Budding Rose',    emoji: '🌹', desc: 'Post for 3 days straight',        streakRequired: 3 },
  { id: 'dedicated',       name: 'Dedicated',       emoji: '💎', desc: 'Post for 7 days straight',        streakRequired: 7 },
  { id: 'two_weeks_warm',  name: 'Two Weeks Warm',  emoji: '🔥', desc: 'Post for 14 days straight',       streakRequired: 14 },
  { id: 'monthly_master',  name: 'Monthly Master',  emoji: '👑', desc: 'Post for 30 days straight',       streakRequired: 30 },
  { id: 'veteran',         name: 'Veteran',         emoji: '⚔️', desc: 'Post for 60 days straight',       streakRequired: 60 },
  { id: 'fond_legend',     name: 'Fond Legend',     emoji: '🏆', desc: 'Post for 100 days straight',      streakRequired: 100 },
  { id: 'mystic',          name: 'Mystic',          emoji: '🌀', desc: 'Collect 7 mystery perks',         streakRequired: -1 },
];

export interface PerkDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

export const PERKS: PerkDef[] = [
  { id: 'golden_frame',    name: 'Golden Frame',    emoji: '🖼️', desc: 'Your post gets a gold border for 24h' },
  { id: 'pen_boost',       name: 'Pen Boost',       emoji: '✍️',  desc: '+5% score boost on next post' },
  { id: 'pin_it',          name: 'Pin It',          emoji: '📌',  desc: 'Pin one post to profile top for 24h' },
  { id: 'moonlight',       name: 'Moonlight',       emoji: '🌙',  desc: 'Profile gets a special dark glow for 24h' },
  { id: 'reaction_drop',   name: 'Reaction Drop',   emoji: '💬',  desc: 'Unlock a unique emoji reaction for 24h' },
  { id: 'badge_fragment',  name: 'Badge Fragment',  emoji: '🧩',  desc: 'Collect 7 to unlock the Mystic badge' },
];
