import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCachedLeaderboard, setCachedLeaderboard } from '@/lib/redis/client';
import { MIN_POSTS_FOR_LEADERBOARD, LEADERBOARD_PAGE_SIZE } from '@/lib/utils/constants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'global';
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const city = searchParams.get('city');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || String(LEADERBOARD_PAGE_SIZE));

    // Build cache identifier
    const cacheId = type === 'local'
      ? `${latitude},${longitude}`
      : type === 'city'
        ? city || 'unknown'
        : 'world';

    // Try cache first
    const cached = await getCachedLeaderboard(type, cacheId);
    if (cached) {
      const start = (page - 1) * limit;
      const paginated = cached.slice(start, start + limit);
      return NextResponse.json({ success: true, data: paginated });
    }

    const supabase = await createServerSupabaseClient();

    // Get all profiles with posts
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, city, latitude, longitude');

    if (!profiles) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Get all posts with scores
    const { data: posts } = await supabase
      .from('posts')
      .select('user_id, ai_score, partner:partners(name, avatar_url, emoji)')
      .not('ai_score', 'is', null)
      .eq('is_public', true);

    if (!posts) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Group posts by user
    const userPosts: Record<string, { scores: number[]; partnerName: string; partnerAvatar: string | null; partnerEmoji: string }> = {};
    for (const post of posts) {
      if (!userPosts[post.user_id]) {
        userPosts[post.user_id] = { scores: [], partnerName: '', partnerAvatar: null, partnerEmoji: '' };
      }
      userPosts[post.user_id].scores.push(post.ai_score!);
      const partnerData = post.partner as unknown;
      const partner = Array.isArray(partnerData)
        ? (partnerData as { name?: string; avatar_url?: string | null; emoji?: string }[])[0]
        : (partnerData as { name?: string; avatar_url?: string | null; emoji?: string } | null);
      if (partner?.name) {
        userPosts[post.user_id].partnerName = partner.name;
      }
      if (partner?.avatar_url) {
        userPosts[post.user_id].partnerAvatar = partner.avatar_url;
      }
      if (partner?.emoji) {
        userPosts[post.user_id].partnerEmoji = partner.emoji;
      }
    }

    // Build leaderboard entries
    const entries = profiles
      .filter((p) => {
        const data = userPosts[p.id];
        if (!data || data.scores.length < MIN_POSTS_FOR_LEADERBOARD) return false;

        // Filter by location
        if (type === 'local' && latitude && longitude) {
          const dist = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            p.latitude || 0,
            p.longitude || 0
          );
          return dist <= 10; // 10km radius
        }
        if (type === 'city' && city) {
          return p.city?.toLowerCase() === city.toLowerCase();
        }
        return true; // global
      })
      .map((p) => {
        const data = userPosts[p.id];
        const avgScore = Math.round(
          data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        );
        return {
          rank: 0, // Will be set after sorting
          user_id: p.id,
          username: p.username,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          average_score: avgScore,
          total_posts: data.scores.length,
          top_partner_name: data.partnerName,
          top_partner_avatar: data.partnerAvatar,
          top_partner_emoji: data.partnerEmoji || '❤️',
        };
      })
      .sort((a, b) => b.average_score - a.average_score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    // Cache the full result
    await setCachedLeaderboard(type, cacheId, entries);

    // Paginate
    const start = (page - 1) * limit;
    const paginated = entries.slice(start, start + limit);

    return NextResponse.json({ success: true, data: paginated });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
