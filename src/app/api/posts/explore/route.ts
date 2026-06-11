import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  try {
    // Use service role to bypass RLS for public posts feed
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
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Explore API] Supabase error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Get current user to check likes
    let userLikes = new Set<string>();
    let userId: string | undefined;
    try {
      const authSupabase = await createServerSupabaseClient();
      const { data: { user }, error: authError } = await authSupabase.auth.getUser();
      
      if (authError) {
        console.log('[Explore API] Auth error:', authError.message);
      }
      
      userId = user?.id;
      
      if (user) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);
        if (likes) {
          userLikes = new Set(likes.map(l => l.post_id));
        }
        console.log(`[Explore API] User ${user.id} has liked ${userLikes.size} posts:`, Array.from(userLikes).slice(0, 3));
      } else {
        console.log('[Explore API] No authenticated user');
      }
    } catch (err) {
      console.log('[Explore API] Auth check failed:', err);
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

    console.log(`[Explore API] Fetched ${enriched.length} posts in ${Date.now() - start}ms`);
    return NextResponse.json({ success: true, data: enriched }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[Explore API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}
