import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { scorePost } from '@/lib/ai/scoring';
import { evaluateStreak, checkNewBadges } from '@/lib/utils/engagement';
import type { BadgeDef } from '@/lib/utils/constants';

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
      .eq('is_archived', false)
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

    // First successful post activates the account for gated app access.
    const activationResult = await supabase
      .from('profiles')
      .update({ activated_at: new Date().toISOString() })
      .eq('id', user.id)
      .is('activated_at', null);

    // Ignore missing-column deployments gracefully until migration is applied.
    if (activationResult.error && (activationResult.error as any).code !== '42703') {
      throw activationResult.error;
    }

    // ─── Update streak ─────────────────────────────────────────────────────
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const todayStr = new Date().toISOString().slice(0, 10);
    const { data: profileRow } = await admin
      .from('profiles')
      .select('streak_count, longest_streak, last_post_date, badges')
      .eq('id', user.id)
      .single();

    let newStreak = 1;
    let longestStreak = 1;
    let newBadges: BadgeDef[] = [];

    if (profileRow && typeof profileRow.streak_count === 'number') {
      const action = evaluateStreak(todayStr, profileRow.last_post_date);
      if (action === 'increment') {
        newStreak = (profileRow.streak_count || 0) + 1;
      } else if (action === 'same-day') {
        newStreak = profileRow.streak_count || 1;
      } else {
        newStreak = 1; // first post or reset
      }

      longestStreak = Math.max(newStreak, profileRow.longest_streak || 0);

      // Check for new badges
      const ownedIds: string[] = Array.isArray(profileRow.badges)
        ? profileRow.badges.map((b: any) => b.id)
        : [];
      newBadges = checkNewBadges(newStreak, ownedIds);

      const badgeUpdate = newBadges.length > 0
        ? [...(profileRow.badges || []), ...newBadges.map((b: any) => ({ id: b.id, name: b.name, emoji: b.emoji, earned_at: new Date().toISOString() }))]
        : profileRow.badges;

      await admin
        .from('profiles')
        .update({
          streak_count: newStreak,
          longest_streak: longestStreak,
          last_post_date: todayStr,
          badges: badgeUpdate,
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      data,
      aiResult,
      streak: { current: newStreak, longest: longestStreak },
      newBadges: newBadges.map((b) => ({ id: b.id, name: b.name, emoji: b.emoji })),
    }, { status: 201 });
  } catch (error) {
    console.error('Posts POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
  }
}
