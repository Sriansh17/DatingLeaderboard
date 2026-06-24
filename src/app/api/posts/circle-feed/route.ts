import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/posts/circle-feed — fetch posts from members of user's circles
export async function GET() {
  const start = Date.now();
  try {
    const authSupabase = await createServerSupabaseClient();
    const { data: { user } } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Get all circles the user is a member of
    const { data: memberships } = await admin
      .from('circle_members')
      .select('circle_id')
      .eq('user_id', user.id);

    const circleIds = memberships?.map(m => m.circle_id) || [];

    if (circleIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Get all members of those circles (excluding current user)
    const { data: circleMembers } = await admin
      .from('circle_members')
      .select('user_id')
      .in('circle_id', circleIds)
      .neq('user_id', user.id);

    const memberUserIds = circleMembers?.map(m => m.user_id) || [];

    if (memberUserIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch public posts from those members
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        partner:partners!partner_id(*),
        profile:profiles!user_id(*),
        likes:likes(count),
        comments:comments(count)
      `)
      .in('user_id', memberUserIds)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Circle Feed API] Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Get current user's likes
    let userLikes = new Set<string>();
    try {
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id);
      if (likes) userLikes = new Set(likes.map(l => l.post_id));
    } catch {}

    const enriched = (data || []).map((post: any) => ({
      ...post,
      likes_count: post.likes?.[0]?.count ?? 0,
      comments_count: post.comments?.[0]?.count ?? 0,
      views_count: post.views_count ?? 0,
      has_liked: userLikes.has(post.id),
      likes: undefined,
      comments: undefined,
    }));

    console.log(`[Circle Feed API] Fetched ${enriched.length} posts in ${Date.now() - start}ms`);
    return NextResponse.json({ success: true, data: enriched }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[Circle Feed API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch circle feed' }, { status: 500 });
  }
}
