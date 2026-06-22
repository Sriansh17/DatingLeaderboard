import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { scorePost } from '@/lib/ai/scoring';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*, partner:partners(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Posts GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { partner_id, description, is_public, timezone_offset_minutes } = await request.json();

    if (!partner_id || !description) {
      return NextResponse.json(
        { success: false, error: 'partner_id and description are required' },
        { status: 400 }
      );
    }

    // Derive start of day in the user's timezone, then convert to UTC for DB filtering.
    const rawOffset = Number(timezone_offset_minutes);
    const safeOffset = Number.isFinite(rawOffset)
      ? Math.max(-840, Math.min(840, Math.trunc(rawOffset)))
      : 0;
    const nowUtc = new Date();
    const userNow = new Date(nowUtc.getTime() - safeOffset * 60_000);
    const startOfUserDayUtc = new Date(
      Date.UTC(userNow.getUTCFullYear(), userNow.getUTCMonth(), userNow.getUTCDate()) + safeOffset * 60_000
    );

    // Read city + premium status; if premium column hasn't been migrated yet, fall back safely.
    let profile: { city: string | null; is_premium?: boolean } | null = null;
    const profileResult = await supabase
      .from('profiles')
      .select('city, is_premium')
      .eq('id', user.id)
      .single();

    if (profileResult.error?.code === '42703') {
      const fallbackProfile = await supabase
        .from('profiles')
        .select('city')
        .eq('id', user.id)
        .single();

      if (fallbackProfile.error) throw fallbackProfile.error;
      profile = { ...fallbackProfile.data, is_premium: false };
    } else if (profileResult.error) {
      throw profileResult.error;
    } else {
      profile = profileResult.data;
    }

    // Non-premium users can create up to 2 posts per day.
    const { count: postCountToday, error: countError } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfUserDayUtc.toISOString());

    if (countError) throw countError;

    const isPremium = !!profile?.is_premium;
    const dailyPosts = postCountToday || 0;

    if (!isPremium && dailyPosts >= 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Free users can only create up to 2 posts per day. Upgrade to premium for unlimited posts.',
          code: 'POST_LIMIT_REACHED',
        },
        { status: 403 }
      );
    }

    // Get AI score
    const aiResult = await scorePost(description);

    if (aiResult.flagged) {
      return NextResponse.json(
        { success: false, flagged: true, error: aiResult.flag_reason || 'This post was flagged as invalid or unrealistic.' },
        { status: 400 }
      );
    }

    // Create post — store city now so old posts don't change when profile updates
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        partner_id,
        description,
        is_public: is_public ?? true,
        ai_score: aiResult.score,
        ai_feedback: aiResult.feedback,
        ai_explanation: JSON.stringify(aiResult.breakdown),
        post_city: profile?.city || null,
      })
      .select('*, partner:partners(*)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data, aiResult }, { status: 201 });
  } catch (error) {
    console.error('Posts POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
  }
}
