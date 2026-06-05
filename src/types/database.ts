export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
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
}

export interface LeaderboardCache {
  id: string;
  data: LeaderboardEntry[];
  expires_at: string;
  created_at: string;
}
