import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/circles/[id]/members — invite a user to the circle (creator/admin only)
// Creates with status='invited' — user must accept via PATCH
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
      .select('*, max_members, members:circle_members!inner(user_id, role, status)')
      .eq('id', id)
      .single();

    if (!circle) {
      return NextResponse.json({ success: false, error: 'Bond not found' }, { status: 404 });
    }

    const requesterMember = circle.members?.find((m: any) => m.user_id === user.id);
    if (!requesterMember || (requesterMember.role !== 'creator' && requesterMember.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Only creators and admins can invite members' }, { status: 403 });
    }

    // Check if target is already a member or already invited
    const existing = circle.members?.find((m: any) => m.user_id === targetUserId);
    if (existing) {
      return NextResponse.json({ success: false, error: 'User is already a member or already invited' }, { status: 400 });
    }

    // Check member limit (only count active members)
    const activeCount = circle.members?.filter((m: any) => m.status !== 'invited').length || 0;
    if (activeCount >= (circle.max_members || 10)) {
      return NextResponse.json({ success: false, error: 'Bond is full' }, { status: 400 });
    }

    // Add the user with invited status
    const { data: newMember, error } = await admin
      .from('circle_members')
      .insert({ circle_id: id, user_id: targetUserId, role: 'member', status: 'invited' })
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

// PATCH /api/circles/[id]/members — accept or reject an invitation
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { action } = await request.json();
    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action. Use "accept" or "reject".' }, { status: 400 });
    }

    const admin = createAdminClient();

    if (action === 'accept') {
      const { error } = await admin
        .from('circle_members')
        .update({ status: 'active' })
        .eq('circle_id', id)
        .eq('user_id', user.id)
        .eq('status', 'invited');

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Joined the bond!' });
    } else {
      // Reject — remove the invitation
      const { error } = await admin
        .from('circle_members')
        .delete()
        .eq('circle_id', id)
        .eq('user_id', user.id)
        .eq('status', 'invited');

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Invitation declined' });
    }
  } catch (error) {
    console.error('Circle member PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to respond to invitation' }, { status: 500 });
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

    // Check if user is creator
    const { data: circle } = await admin
      .from('circles')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!circle) {
      return NextResponse.json({ success: false, error: 'Bond not found' }, { status: 404 });
    }

    if (userIdToRemove !== user.id && circle.created_by !== user.id) {
      return NextResponse.json({ success: false, error: 'Only the creator can remove other members' }, { status: 403 });
    }

    if (userIdToRemove === circle.created_by) {
      return NextResponse.json({ success: false, error: 'Cannot remove the creator. Delete the bond instead.' }, { status: 400 });
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
