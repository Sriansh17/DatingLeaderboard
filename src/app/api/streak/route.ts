import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { streakMultiplier, pickDailyPerk, checkNewBadges } from '@/lib/utils/engagement';
import { BADGES, PERKS } from '@/lib/utils/constants';

export const dynamic = 'force-dynamic';

// ─── GET /api/streak — Return current streak info
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await admin
      .from('profiles')
      .select('streak_count, longest_streak, last_post_date, badges, active_perks, last_perk_date, collected_perk_ids')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ success: true, data: {
        streak: 0, longest: 0, multiplier: 1, badges: [], perks: [], canClaimPerk: false,
      }});
    }

    const streakCount = profile.streak_count || 0;
    const multiplier = streakMultiplier(streakCount);

    // Resolve full badge definitions
    const badges = (profile.badges || []).map((b: any) => {
      const def = BADGES.find((d) => d.id === b.id);
      return { ...b, emoji: def?.emoji || '🏅', name: def?.name || b.id };
    });

    // Check if user can claim a daily perk (posted today and hasn't claimed yet)
    const todayStr = new Date().toISOString().slice(0, 10);
    const canClaimPerk =
      profile.last_post_date === todayStr &&
      profile.last_perk_date !== todayStr;

    const nextBadge = BADGES
      .filter((b) => b.streakRequired > 0 && !(profile.badges || []).some((ob: any) => ob.id === b.id))
      .sort((a, b) => a.streakRequired - b.streakRequired)[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        streak: streakCount,
        longest: profile.longest_streak || 0,
        multiplier,
        multiplierPercent: Math.round((multiplier - 1) * 100),
        badges,
        nextBadge: nextBadge ? {
          id: nextBadge.id,
          name: nextBadge.name,
          emoji: nextBadge.emoji,
          streakRequired: nextBadge.streakRequired,
          progress: Math.min(streakCount / nextBadge.streakRequired, 1),
        } : null,
        canClaimPerk,
        lastPostDate: profile.last_post_date,
      },
    });
  } catch (error) {
    console.error('[streak/GET] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get streak' }, { status: 500 });
  }
}

// ─── POST /api/streak — Claim daily mystery perk
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await admin
      .from('profiles')
      .select('last_post_date, last_perk_date, collected_perk_ids, badges, active_perks')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    // Must have posted today and not already claimed
    if (profile.last_post_date !== todayStr) {
      return NextResponse.json({ success: false, error: 'Post today first to claim your daily perk' }, { status: 400 });
    }
    if (profile.last_perk_date === todayStr) {
      return NextResponse.json({ success: false, error: 'Already claimed today' }, { status: 400 });
    }

    // Pick a random perk
    const collected: string[] = profile.collected_perk_ids || [];
    const perk = pickDailyPerk(collected);

    // Track fragment collection for mystic badge
    const updatedCollected = perk.id === 'badge_fragment'
      ? [...collected, perk.id]
      : collected;

    const fragmentCount = updatedCollected.filter((id: string) => id === 'badge_fragment').length;

    // Check mystic badge (collect 7 fragments)
    let mysticUnlocked = false;
    let updatedBadges = profile.badges || [];
    if (fragmentCount >= 7) {
      const hasMystic = (updatedBadges as any[]).some((b: any) => b.id === 'mystic');
      if (!hasMystic) {
        mysticUnlocked = true;
        updatedBadges = [
          ...(updatedBadges as any[]),
          { id: 'mystic', name: 'Mystic', emoji: '🌀', earned_at: new Date().toISOString() },
        ];
      }
    }

    // Build active perk with expiry (24h)
    const perkEntry = {
      id: perk.id,
      name: perk.name,
      emoji: perk.emoji,
      claimed_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const existingPerks: any[] = profile.active_perks || [];
    // Remove expired perks
    const now = new Date();
    const freshPerks = existingPerks.filter((p: any) => new Date(p.expires_at) > now);
    freshPerks.push(perkEntry);

    await admin
      .from('profiles')
      .update({
        last_perk_date: todayStr,
        collected_perk_ids: updatedCollected,
        active_perks: freshPerks,
        badges: updatedBadges,
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      data: {
        perk: { id: perk.id, name: perk.name, emoji: perk.emoji },
        fragmentCount,
        mysticUnlocked,
        activePerks: freshPerks,
      },
    });
  } catch (error) {
    console.error('[streak/POST] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to claim perk' }, { status: 500 });
  }
}
