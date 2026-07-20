import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_EMOJIS = ['🔥', '😭', '👀', '💀'];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, data: {} });
    }

    const admin = createAdminClient();
    const { data: reactions } = await admin
      .from('post_reactions')
      .select('emoji')
      .eq('post_id', id)
      .eq('user_id', user.id);

    const userReactions: Record<string, boolean> = {};
    if (reactions) {
      for (const r of reactions) {
        userReactions[r.emoji] = true;
      }
    }

    return NextResponse.json({ success: true, data: userReactions });
  } catch (error) {
    console.error('Reactions GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reactions' }, { status: 500 });
  }
}

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
    if (!emoji || !VALID_EMOJIS.includes(emoji)) {
      return NextResponse.json({ success: false, error: 'Invalid reaction' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: existing } = await admin
      .from('post_reactions')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .maybeSingle();

    if (existing) {
      await admin.from('post_reactions').delete().eq('id', existing.id);
    } else {
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
