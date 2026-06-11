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
  country: string | null;
  // Onboarding fields
  has_onboarded: boolean | null;
  relationship_status: string | null;
  onboarding_goals: string[] | null;
  love_languages: string[] | null;
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
  created_at: string;
  updated_at: string;
  // Joined fields
  partner?: Partner;
  profile?: Profile;
  post_city?: string | null;
  // Computed fields
  likes_count?: number;
  comments_count?: number;
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

export interface LeaderboardCache {
  id: string;
  data: LeaderboardEntry[];
  expires_at: string;
  created_at: string;
}
