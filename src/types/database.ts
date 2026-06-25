export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  age: string | null;
  gender: string | null;
  occupation: string | null;
  phone: string | null;
  date_of_birth: string | null;
  country: string | null;
  state: string | null;
  // Onboarding fields
  has_onboarded: boolean | null;
  relationship_status: string | null;
  onboarding_goals: string[] | null;
  love_languages: string[] | null;
  is_premium: boolean;
  is_admin: boolean;
  // Streak restoration
  streak_override_count: number | null;
  streak_override_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  user_id: string;
  name: string;
  relationship: 'spouse' | 'partner' | 'boyfriend' | 'girlfriend' | 'other';
  emoji: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  partner_id: string;
  description: string;
  ai_score: number | null;
  ai_feedback: string | null;
  ai_explanation: string | null;
  is_public: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  partner?: Partner;
  profile?: Profile;
  post_city?: string | null;
  // Computed fields
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  has_liked?: boolean;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  profile?: Profile;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Joined fields
  profile?: Profile;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  average_score: number;
  total_posts: number;
  top_partner_name: string;
  top_partner_avatar: string | null;
  top_partner_emoji: string;
}

export interface Circle {
  id: string;
  name: string;
  emoji: string;
  code: string;
  created_by: string;
  max_members: number;
  invite_expires_at: string | null;
  passcode: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  creator?: Profile;
  members?: CircleMember[];
  member_count?: number;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: 'creator' | 'admin' | 'member';
  joined_at: string;
  // Joined fields
  profile?: Profile;
  avg_score?: number;
  total_posts?: number;
}

export interface Flag {
  id: string;
  post_id: string;
  user_id: string;
  reason: string;
  created_at: string;
}

export type ReactionType = 'peek' | 'spicy' | 'relatable' | 'dead' | 'wholesome';

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  peek: '👀',
  spicy: '🔥',
  relatable: '😭',
  dead: '💀',
  wholesome: '🫶',
};

export const REACTION_LABELS: Record<ReactionType, string> = {
  peek: 'Peek',
  spicy: 'Spicy',
  relatable: 'Relatable',
  dead: 'Dead',
  wholesome: 'Wholesome',
};

export interface ConfessionReaction {
  id: string;
  confession_id: string;
  user_id: string;
  reaction: ReactionType;
  created_at: string;
}

export interface ConfessionReply {
  id: string;
  confession_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Anonymous identity (computed, not stored)
  anonymous_emoji?: string;
  anonymous_color?: string;
}

export interface Confession {
  id: string;
  user_id: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields
  reaction_counts: Record<ReactionType, number>;
  user_reaction: ReactionType | null;
  is_confession_of_day: boolean;
  replies_count: number;
  // Joined fields
  profile?: Profile;
}

export interface LeaderboardCache {
  id: string;
  data: LeaderboardEntry[];
  expires_at: string;
  created_at: string;
}

// ─── Connection / Bond feature ─────────────────────────────────────────────────────

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';

export interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  // Joined fields
  sender?: Profile;
  receiver?: Profile;
}

export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  created_at: string;
  // Joined fields
  profile?: Profile;
}

// ─── Notifications ─────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'clique_invite'
  | 'clique_joined';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string | null;
  reference_id: string | null;
  read: boolean;
  created_at: string;
  // Joined fields
  actor?: Profile;
}

// ─── Subscription ──────────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  amount: number | null;
  currency: string | null;
  status: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  updated_at: string;
}
