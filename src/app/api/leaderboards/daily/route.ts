import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { applyStreakBoost } from '@/lib/utils/engagement';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse timezone offset from query params (minutes, e.g. -330 for IST)
    const { searchParams } = new URL(request.url);
    const offsetMinutes = parseInt(searchParams.get('tz') || '0') || 0;

    // Calculate start of "today" in the user's local timezone
    const now = new Date();
    const userNow = new Date(now.getTime() - offsetMinutes * 60_000);
    const todayStart = new Date(
      Date.UTC(userNow.getUTCFullYear(), userNow.getUTCMonth(), userNow.getUTCDate()) + offsetMinutes * 60_000
    );

    // Step 1: Get all public posts from today with scores
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        description,
        ai_score,
        created_at,
        user_id,
        partner:partners!partner_id(name, emoji, avatar_url)
      `)
      .not('ai_score', 'is', null)
      .eq('is_public', true)
      .gte('created_at', todayStart.toISOString())
      .order('ai_score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[leaderboards/daily] query error:', error);
      throw error;
    }
    if (!posts || posts.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Step 2: Fetch profiles for the post authors
    const userIds = Array.from(new Set(posts.map((p) => p.user_id)));
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, streak_count')
      .in('id', userIds);

    const profileMap: Record<string, any> = {};
    if (profiles) {
      for (const p of profiles) {
        profileMap[p.id] = p;
      }
    }

    // Step 3: Enrich with profile data and streak boost
    const enriched = posts.map((post: any, idx: number) => {
      const rawScore = post.ai_score || 0;
      const profile = profileMap[post.user_id] || {};
      const streakCount = profile.streak_count || 0;
      const boostedScore = applyStreakBoost(rawScore, streakCount);

      const rawPartner = post.partner;
      const partner = Array.isArray(rawPartner) ? rawPartner[0] : rawPartner;

      return {
        rank: idx + 1,
        id: post.id,
        score: boostedScore,
        rawScore,
        description: post.description?.slice(0, 120),
        created_at: post.created_at,
        user: {
          id: post.user_id,
          username: profile?.username || 'anonymous',
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
        },
        partner: {
          name: partner?.name || 'Unknown',
          emoji: partner?.emoji || '💖',
          avatar_url: partner?.avatar_url,
        },
      };
    });

    return NextResponse.json({ success: true, data: enriched, date: todayStart.toISOString().slice(0, 10) });
  } catch (error) {
    console.error('[leaderboards/daily] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch daily leaderboard' }, { status: 500 });
  }
}
