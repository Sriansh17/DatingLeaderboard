import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCachedLeaderboard, setCachedLeaderboard } from '@/lib/redis/client';
import { MIN_POSTS_FOR_LEADERBOARD, LEADERBOARD_PAGE_SIZE } from '@/lib/utils/constants';

export async function GET(request: Request) {
  const startTime = Date.now();
  console.log(`[Leaderboard] ⏱️ Request started`);

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'global';
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || String(LEADERBOARD_PAGE_SIZE));

    console.log(`[Leaderboard] Type: ${type}, Page: ${page}`);

    // Build cache identifier
    const cacheId = type === 'local'
      ? `${latitude},${longitude}`
      : type === 'city'
        ? city || 'unknown'
        : type === 'country'
          ? country || 'unknown'
        : 'world';

    // Check cache first
    const cached = await getCachedLeaderboard(type, cacheId);
    if (cached && Array.isArray(cached)) {
      // Paginate cached data
      const start = (page - 1) * limit;
      const paginated = cached.slice(start, start + limit);
      console.log(`[Leaderboard] ✅ Cache hit (${cached.length} entries) — ${Date.now() - startTime}ms`);
      return NextResponse.json({ success: true, data: paginated, cached: true });
    }

    const supabaseStart = Date.now();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    console.log(`[Leaderboard] Supabase client created: ${Date.now() - supabaseStart}ms`);

    // Get all profiles with posts
    const profilesStart = Date.now();
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, city, country, latitude, longitude');
    console.log(`[Leaderboard] Profiles query: ${Date.now() - profilesStart}ms | Count: ${profiles?.length || 0}`);

    if (!profiles) {
      console.log(`[Leaderboard] ⚠️ No profiles found, returning empty`);
      return NextResponse.json({ success: true, data: [] });
    }

    // Get all posts with scores
    const postsStart = Date.now();
    const { data: posts } = await supabase
      .from('posts')
      .select('*, partner:partners(name, avatar_url, emoji)')
      .not('ai_score', 'is', null)
      .eq('is_public', true);
    console.log(`[Leaderboard] Posts query: ${Date.now() - postsStart}ms | Count: ${posts?.length || 0}`);

    if (!posts) {
      console.log(`[Leaderboard] ⚠️ No posts found, returning empty`);
      return NextResponse.json({ success: true, data: [] });
    }

    // Group posts by user
    const userPosts: Record<string, { scores: number[]; partners: Record<string, { count: number; avatar: string | null; emoji: string }> }> = {};
    for (const post of posts) {
      if (!userPosts[post.user_id]) {
        userPosts[post.user_id] = { scores: [], partners: {} };
      }
      userPosts[post.user_id].scores.push(post.ai_score!);

      // Extract partner data
      const rawPartner = post.partner;
      if (rawPartner) {
        const partner = Array.isArray(rawPartner) ? rawPartner[0] : rawPartner;
        if (partner?.name) {
          if (!userPosts[post.user_id].partners[partner.name]) {
            userPosts[post.user_id].partners[partner.name] = { count: 0, avatar: partner.avatar_url || null, emoji: partner.emoji || '❤️' };
          }
          userPosts[post.user_id].partners[partner.name].count++;
        }
      }
    }

    // Build leaderboard entries
    const entries = profiles
      .filter((p) => {
        const data = userPosts[p.id];
        if (!data || data.scores.length < MIN_POSTS_FOR_LEADERBOARD) return false;

        // Filter by location
        if (type === 'local') {
          let matchedLoc = false;
          // Only filter by distance if we have valid coordinates
          if (latitude && longitude && parseFloat(latitude) !== 0 && parseFloat(longitude) !== 0) {
            const dist = calculateDistance(
              parseFloat(latitude),
              parseFloat(longitude),
              p.latitude || 0,
              p.longitude || 0
            );
            if (dist <= 25) { // 25km radius
              console.log(`[Leaderboard] User ${p.username} is in local range (${dist.toFixed(1)}km)`);
              matchedLoc = true;
            }
          }
          // Fallback to strict city string match if distance fails or coordinates are missing
          if (!matchedLoc && city && p.city?.toLowerCase() === city.toLowerCase()) {
            console.log(`[Leaderboard] User ${p.username} matched by city string fallback (${city})`);
            matchedLoc = true;
          }
          return matchedLoc;
        }
        if (type === 'city' && city) {
          return p.city?.toLowerCase() === city.toLowerCase();
        }
        if (type === 'country' && country) {
          return (p as any).country?.toLowerCase() === country.toLowerCase();
        }
        return true; // global
      })
      .map((p) => {
        const data = userPosts[p.id];
        const avgScore = Math.round(
          data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        );

        // Find the most-used partner
        const partnerEntries = Object.entries(data.partners);
        let topPartnerName = '';
        let topPartnerAvatar: string | null = null;
        let topPartnerEmoji = '❤️';
        if (partnerEntries.length > 0) {
          const sorted = partnerEntries.sort((a, b) => b[1].count - a[1].count);
          topPartnerName = sorted[0][0];
          topPartnerAvatar = sorted[0][1].avatar;
          topPartnerEmoji = sorted[0][1].emoji;
        }

        return {
          rank: 0, // Will be set after sorting
          user_id: p.id,
          username: p.username,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          average_score: avgScore,
          total_posts: data.scores.length,
          top_partner_name: topPartnerName,
          top_partner_avatar: topPartnerAvatar,
          top_partner_emoji: topPartnerEmoji,
        };
      })
      .sort((a, b) => b.average_score - a.average_score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    console.log(`[Leaderboard] Entries computed: ${entries.length} qualified`);

    // Cache the full (unpaginated) results
    await setCachedLeaderboard(type, cacheId, entries);

    // Paginate
    const start = (page - 1) * limit;
    const paginated = entries.slice(start, start + limit);

    console.log(`[Leaderboard] ✅ Total request time: ${Date.now() - startTime}ms`);
    return NextResponse.json({ success: true, data: paginated });
  } catch (error) {
    console.error(`[Leaderboard] ❌ Error after ${Date.now() - startTime}ms:`, error);
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
