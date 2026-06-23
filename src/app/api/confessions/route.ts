import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ReactionType } from '@/types/database';

export const dynamic = 'force-dynamic';

const ALL_REACTIONS: ReactionType[] = ['peek', 'spicy', 'relatable', 'dead', 'wholesome'];

// GET /api/confessions — fetch confessions feed with reactions + confession of the day
export async function GET() {
  const start = Date.now();
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch confessions with profile
    const { data, error } = await supabase
      .from('confessions')
      .select(`
        *,
        profile:profiles!user_id(id, username, avatar_url)
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Confessions API] Supabase error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Build reaction counts per confession (gracefully handles missing table)
    let reactionData = new Map<string, { counts: Record<string, number>; userReaction: string | null }>();
    try {
      const { data: allReactions } = await supabase
        .from('confession_reactions')
        .select('confession_id, reaction');

      if (allReactions) {
        allReactions.forEach((r: any) => {
          if (!reactionData.has(r.confession_id)) {
            reactionData.set(r.confession_id, { counts: {}, userReaction: null });
          }
          const entry = reactionData.get(r.confession_id)!;
          entry.counts[r.reaction] = (entry.counts[r.reaction] || 0) + 1;
        });
      }
    } catch (err) {
      console.log('[Confessions API] Reactions table not available');
    }

    // Get current user's reactions
    let userReactions = new Map<string, string>();
    try {
      const authSupabase = await createServerSupabaseClient();
      const { data: { user } } = await authSupabase.auth.getUser();

      if (user) {
        const { data: myReactions } = await supabase
          .from('confession_reactions')
          .select('confession_id, reaction')
          .eq('user_id', user.id);

        if (myReactions) {
          myReactions.forEach((r: any) => {
            userReactions.set(r.confession_id, r.reaction);
          });
        }
      }
    } catch (err) {
      console.log('[Confessions API] Auth check failed:', err);
    }

    // Build replies count per confession (gracefully handles missing table)
    let repliesCount = new Map<string, number>();
    try {
      const { data: allReplies } = await supabase
        .from('confession_replies')
        .select('confession_id');

      if (allReplies) {
        allReplies.forEach((r: any) => {
          repliesCount.set(r.confession_id, (repliesCount.get(r.confession_id) || 0) + 1);
        });
      }
    } catch (err) {
      console.log('[Confessions API] Replies table not available');
    }

    // Compute confession of the day: most total reactions in the last 24 hours
    let confessionOfTheDayId: string | null = null;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Filter confessions from last 24h and find the one with most reactions
    let maxReactions = 0;
    for (const item of data || []) {
      if (item.created_at >= oneDayAgo) {
        const entry = reactionData.get(item.id);
        const total = entry ? Object.values(entry.counts).reduce((sum, c) => sum + c, 0) : 0;
        if (total > maxReactions && total >= 2) {
          maxReactions = total;
          confessionOfTheDayId = item.id;
        }
      }
    }

    // Enrich with reaction data
    const enriched = (data || []).map((item: any) => {
      const entry = reactionData.get(item.id);
      const counts: Record<string, number> = {};
      for (const r of ALL_REACTIONS) {
        counts[r] = entry?.counts[r] || 0;
      }
      return {
        ...item,
        reaction_counts: counts,
        user_reaction: userReactions.get(item.id) || null,
        is_confession_of_day: item.id === confessionOfTheDayId,
        replies_count: repliesCount.get(item.id) || 0,
        // Remove old fields
        likes_count: undefined,
        has_liked: undefined,
      };
    });

    // Sort: confession of the day first, then by created_at desc
    enriched.sort((a: any, b: any) => {
      if (a.is_confession_of_day) return -1;
      if (b.is_confession_of_day) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    console.log(`[Confessions API] Fetched ${enriched.length} confessions in ${Date.now() - start}ms`);
    return NextResponse.json({ success: true, data: enriched }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[Confessions API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch confessions' }, { status: 500 });
  }
}

// POST /api/confessions — create a new anonymous confession
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    if (content.trim().length < 10) {
      return NextResponse.json({ success: false, error: 'Confession must be at least 10 characters' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('confessions')
      .insert({
        user_id: user.id,
        content: content.trim(),
      })
      .select(`*, profile:profiles!user_id(id, username, avatar_url)`)
      .single();

    if (error) {
      console.error('[Confessions API] Insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const emptyCounts: Record<string, number> = {};
    for (const r of ALL_REACTIONS) emptyCounts[r] = 0;

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        reaction_counts: emptyCounts,
        user_reaction: null,
        is_confession_of_day: false,
        replies_count: 0,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[Confessions API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create confession' }, { status: 500 });
  }
}
