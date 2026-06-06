export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface AIScoreResult {
  score: number;
  feedback: string;
  explanation: string;
  breakdown: {
    thoughtfulness: number;
    romance: number;
    effort: number;
    uniqueness: number;
    emotional_impact: number;
  };
  flagged?: boolean;
  flag_reason?: string;
}

export interface CreatePostPayload {
  partner_id: string;
  description: string;
  is_public?: boolean;
}

export interface CreatePartnerPayload {
  name: string;
  relationship: 'spouse' | 'partner' | 'boyfriend' | 'girlfriend' | 'other';
  emoji?: string;
}

export interface UpdateProfilePayload {
  username?: string;
  full_name?: string;
  bio?: string;
  city?: string;
  avatar_url?: string;
}

export interface LeaderboardQuery {
  type: 'local' | 'city' | 'country' | 'global';
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  page?: number;
  limit?: number;
}
