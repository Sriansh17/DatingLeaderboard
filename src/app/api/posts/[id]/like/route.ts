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
