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
} as const;

export const MIN_POSTS_FOR_LEADERBOARD = 1;
export const LEADERBOARD_PAGE_SIZE = 50;
export const LOCAL_RADIUS_KM = 10;
export const POSTS_PER_PAGE = 20;
export const SCORE_ANIMATION_DURATION = 1500; // ms
