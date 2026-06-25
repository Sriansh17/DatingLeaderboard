import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/circles/[id]/members — invite a user to the circle (creator/admin only)
export async function POST(
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

    const { user_id: targetUserId } = await request.json();
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'Missing user_id' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check circle exists and requester is creator or admin
    const { data: circle } = await admin
      .from('circles')
      .select('*, members:circle_members!inner(user_id, role)')
      .eq('id', id)
      .single();

    if (!circle) {
      return NextResponse.json({ success: false, error: 'Circle not found' }, { status: 404 });
    }

    const requesterMember = circle.members?.find((m: any) => m.user_id === user.id);
    if (!requesterMember || (requesterMember.role !== 'creator' && requesterMember.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Only creators and admins can invite members' }, { status: 403 });
    }

    // Check if target is already a member
    const alreadyMember = circle.members?.some((m: any) => m.user_id === targetUserId);
    if (alreadyMember) {
      return NextResponse.json({ success: false, error: 'User is already a member' }, { status: 400 });
    }

    // Check member limit
    if (circle.members && circle.members.length >= (circle.max_members || 10)) {
      return NextResponse.json({ success: false, error: 'Circle is full' }, { status: 400 });
    }

    // Add the user
    const { data: newMember, error } = await admin
      .from('circle_members')
      .insert({ circle_id: id, user_id: targetUserId, role: 'member' })
      .select()
      .single();

    if (error) throw error;

    // Create notification for the invited user
    await admin
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: 'clique_invite',
        actor_id: user.id,
        reference_id: id,
      })
      .maybeSingle();

    return NextResponse.json({ success: true, data: newMember });
  } catch (error) {
    console.error('Circle member POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to invite member' },
      { status: 500 }
    );
  }
}

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
