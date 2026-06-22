import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    // Enrich posts with counts
    const enrichedPosts = (posts || []).map((post: any) => ({
      ...post,
      likes_count: post.likes?.[0]?.count ?? 0,
      comments_count: post.comments?.[0]?.count ?? 0,
      likes: undefined,
      comments: undefined,
    }));

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
        },
        posts: enrichedPosts,
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
