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
