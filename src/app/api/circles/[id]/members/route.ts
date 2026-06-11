import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// DELETE /api/circles/[id]/members — leave a circle (or kick if creator)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { target_user_id } = await request.json().catch(() => ({}));
    const userIdToRemove = target_user_id || user.id;
    const admin = createAdminClient();

    // Check if user is creator (only creator can remove others)
    const { data: circle } = await admin
      .from('circles')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!circle) {
      return NextResponse.json({ success: false, error: 'Circle not found' }, { status: 404 });
    }

    if (userIdToRemove !== user.id && circle.created_by !== user.id) {
      return NextResponse.json({ success: false, error: 'Only the creator can remove other members' }, { status: 403 });
    }

    // Cannot remove the creator
    if (userIdToRemove === circle.created_by) {
      return NextResponse.json({ success: false, error: 'Cannot remove the creator. Delete the circle instead.' }, { status: 400 });
    }

    const { error } = await admin
      .from('circle_members')
      .delete()
      .eq('circle_id', id)
      .eq('user_id', userIdToRemove);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Member removed' });
  } catch (error) {
    console.error('Circle member DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove member' }, { status: 500 });
  }
}
