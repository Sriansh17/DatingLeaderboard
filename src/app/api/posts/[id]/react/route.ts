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

    const { emoji } = await _request.json();
    if (!emoji || !['🔥', '😭', '👀', '💀'].includes(emoji)) {
      return NextResponse.json({ success: false, error: 'Invalid reaction' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Toggle: check if already reacted with this emoji
    const { data: existing } = await admin
      .from('post_reactions')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .maybeSingle();

    if (existing) {
      // Remove reaction
      await admin.from('post_reactions').delete().eq('id', existing.id);
    } else {
      // Add reaction
      await admin.from('post_reactions').insert({
        post_id: id,
        user_id: user.id,
        emoji,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reaction toggle error:', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle reaction' }, { status: 500 });
  }
}
