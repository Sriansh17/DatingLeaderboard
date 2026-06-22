import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { POSTS_PER_PAGE } from '@/lib/utils/constants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || String(POSTS_PER_PAGE));
    const start = (page - 1) * limit;

    const supabase = await createServerSupabaseClient();
    const admin = createAdminClient();

    const { data, error, count } = await admin
      .from('posts')
      .select(`
        *,
        partner:partners(*),
        profile:profiles(*),
        likes:likes(count),
        comments:comments(count)
      `, { count: 'exact' })
      .eq('is_public', true)
      .eq('is_archived', false)
      .not('ai_score', 'is', null)
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);

    if (error) throw error;

    // Get current user to check likes
    let userLikes = new Set<string>();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: likes } = await admin
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);
        if (likes) {
          userLikes = new Set(likes.map(l => l.post_id));
        }
      }
    } catch {
      // Not logged in
    }

    // Flatten counts and add has_liked
    const enriched = (data || []).map((post: any) => ({
      ...post,
      likes_count: post.likes?.[0]?.count ?? 0,
      comments_count: post.comments?.[0]?.count ?? 0,
      has_liked: userLikes.has(post.id),
      likes: undefined,
      comments: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > start + limit,
    });
  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch feed' }, { status: 500 });
  }
}
