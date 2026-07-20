import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Toggle like using atomic insert-on-conflict-do-delete
    // This avoids race conditions from the read-then-write pattern
    const { data: existing } = await admin
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await admin
        .from('likes')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;

      // Clean up any stale notification for this like
      await admin
        .from('notifications')
        .delete()
        .eq('actor_id', user.id)
        .eq('type', 'post_like')
        .eq('reference_id', id);

      const { count } = await admin
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', id);
      return NextResponse.json({ success: true, liked: false, likes_count: count || 0 });
    } else {
      const { error } = await admin
        .from('likes')
        .insert({ post_id: id, user_id: user.id });

      if (error) throw error;

      // Notify post owner about the like (skip self-likes)
      const { data: post } = await admin
        .from('posts')
        .select('user_id')
        .eq('id', id)
        .single();

      if (post && post.user_id !== user.id) {
        // Dedup: only insert if no existing notification for this (user, actor, type, reference)
        const { data: existingNotif } = await admin
          .from('notifications')
          .select('id')
          .eq('user_id', post.user_id)
          .eq('actor_id', user.id)
          .eq('type', 'post_like')
          .eq('reference_id', id)
          .maybeSingle();

        if (!existingNotif) {
          await admin.from('notifications').insert({
            user_id: post.user_id,
            actor_id: user.id,
            type: 'post_like',
            reference_id: id,
          });
        }
      }

      const { count } = await admin
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', id);
      return NextResponse.json({ success: true, liked: true, likes_count: count || 0 });
    }
  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle like' }, { status: 500 });
  }
}
