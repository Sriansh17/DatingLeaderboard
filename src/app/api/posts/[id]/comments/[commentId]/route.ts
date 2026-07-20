import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const admin = createAdminClient();

    // Vote update — atomic increment instead of set to avoid race conditions
    if (body.votes !== undefined && typeof body.votes === 'number') {
      const delta = body.delta ?? 1;
      const { data, error } = await admin.rpc('increment_comment_votes', {
        comment_id: commentId,
        delta,
      });

      if (error) {
        console.error('[Comment PATCH] RPC error:', error);
        // Fallback: non-atomic increment
        const { data: comment } = await admin.from('comments').select('votes').eq('id', commentId).single();
        const newVotes = Math.max(0, ((comment?.votes as number) || 0) + delta);
        const { error: updateError } = await admin.from('comments').update({ votes: newVotes }).eq('id', commentId);
        if (updateError) throw updateError;
        return NextResponse.json({ success: true, data: { votes: newVotes } });
      }

      return NextResponse.json({ success: true, data: { votes: data } });
    }

    // Reaction update
    if (body.reaction) {
      const { data: comment } = await admin.from('comments').select('reactions').eq('id', commentId).single();
      const reactions = (comment?.reactions as Record<string, number>) || {};
      const emoji = body.reaction;
      reactions[emoji] = (reactions[emoji] || 0) + 1;

      const { error } = await admin.from('comments').update({ reactions }).eq('id', commentId);
      if (error) throw error;
      return NextResponse.json({ success: true, data: { reactions } });
    }

    // Content update (edit)
    if (body.content) {
      const { error } = await admin.from('comments').update({ content: body.content.trim() }).eq('id', commentId).eq('user_id', user.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'No valid operation' }, { status: 400 });
  } catch (error) {
    console.error('Comment PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { error } = await admin.from('comments').delete().eq('id', commentId).eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete comment' }, { status: 500 });
  }
}
