import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/users/[id] — public profile for any user
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    // Fetch profile
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Fetch public posts
    const { data: posts } = await admin
      .from('posts')
      .select('*, partner:partners(*), likes:likes(count), comments:comments(count)')
      .eq('user_id', id)
      .eq('is_public', true)
      .not('ai_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch partners
    const { data: partners } = await admin
      .from('partners')
      .select('id, name, emoji')
      .eq('user_id', id)
      .eq('is_active', true);

    // Calculate stats
    const scoredPosts = (posts || []).filter(p => p.ai_score);
    const avgScore = scoredPosts.length > 0
      ? Math.round(scoredPosts.reduce((a, b) => a + b.ai_score!, 0) / scoredPosts.length * 10) / 10
      : 0;

    const topPartner = partners && partners.length > 0 ? partners[0] : null;

    // Check if current user has premium (for extended data)
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    let isPremiumViewer = false;
    if (user) {
      const { data: subscription } = await admin
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      isPremiumViewer = !!subscription;
    }

    // Check connection status between viewer and profile owner
    let connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'connected' = 'none';
    if (user && user.id !== id) {
      // Check if connected
      const { data: connected } = await admin
        .from('connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('connected_user_id', id)
        .maybeSingle();

      if (connected) {
        connectionStatus = 'connected';
      } else {
        // Check for pending request from viewer to profile owner
        const { data: sentRequest } = await admin
          .from('connection_requests')
          .select('id')
          .eq('sender_id', user.id)
          .eq('receiver_id', id)
          .eq('status', 'pending')
          .maybeSingle();

        if (sentRequest) {
          connectionStatus = 'pending_sent';
        } else {
          // Check for pending request from profile owner to viewer
          const { data: receivedRequest } = await admin
            .from('connection_requests')
            .select('id')
            .eq('sender_id', id)
            .eq('receiver_id', user.id)
            .eq('status', 'pending')
            .maybeSingle();

          if (receivedRequest) {
            connectionStatus = 'pending_received';
          }
        }
      }
    }

    // Enrich posts with counts
    const enrichedPosts = (posts || []).map((post: any) => ({
      ...post,
      likes_count: post.likes?.[0]?.count ?? 0,
      comments_count: post.comments?.[0]?.count ?? 0,
      likes: undefined,
      comments: undefined,
    }));

    // Calculate global rank
    let rank = null;
    if (avgScore > 0) {
      const { data: allScores } = await admin
        .from('posts')
        .select('user_id, ai_score')
        .not('ai_score', 'is', null);

      if (allScores) {
        const userAvgs: Record<string, number[]> = {};
        allScores.forEach(p => {
          if (!userAvgs[p.user_id]) userAvgs[p.user_id] = [];
          userAvgs[p.user_id].push(p.ai_score!);
        });
        const avgMap: Record<string, number> = {};
        Object.entries(userAvgs).forEach(([uid, scores]) => {
          avgMap[uid] = scores.reduce((a, b) => a + b, 0) / scores.length;
        });
        const sorted = Object.entries(avgMap).sort(([, a], [, b]) => b - a);
        const pos = sorted.findIndex(([uid]) => uid === id);
        rank = pos >= 0 ? pos + 1 : null;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          city: profile.city,
          created_at: isPremiumViewer ? profile.created_at : undefined,
        },
        stats: {
          post_count: scoredPosts.length,
          average_score: avgScore,
          top_partner_name: topPartner?.name || null,
          top_partner_emoji: topPartner?.emoji || null,
          rank,
        },
        posts: enrichedPosts,
        connection_status: user ? connectionStatus : undefined,
        // Extended data — only for premium viewers
        ...(isPremiumViewer ? {
          partners: partners || [],
          extended_posts: true,
        } : {}),
      },
    });
  } catch (error) {
    console.error('User profile GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}
