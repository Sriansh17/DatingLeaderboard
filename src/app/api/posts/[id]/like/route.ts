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

    console.log('[Like API] User:', user?.id, 'Post:', id);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Check if already liked
    const { data: existing } = await admin
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('[Like API] Existing like:', existing?.id);

    if (existing) {
      // Unlike
      const { error } = await admin
        .from('likes')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
      console.log('[Like API] Unliked post', id);
      return NextResponse.json({ success: true, liked: false });
    } else {
      // Like
      const { error } = await admin
        .from('likes')
        .insert({ post_id: id, user_id: user.id });

      if (error) throw error;
      console.log('[Like API] Liked post', id);
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle like' }, { status: 500 });
  }
}
