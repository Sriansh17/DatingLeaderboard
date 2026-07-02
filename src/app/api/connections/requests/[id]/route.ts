import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// PATCH /api/connections/requests/[id] — accept or reject a request
export async function PATCH(
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

    const { status: newStatus } = await request.json();
    if (!newStatus || !['accepted', 'rejected'].includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: 'Status must be "accepted" or "rejected"' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Fetch the request and verify receiver
    const { data: reqData, error: fetchError } = await admin
      .from('connection_requests')
      .select('*, sender:sender_id(id, username, full_name, avatar_url)')
      .eq('id', id)
      .single();

    if (fetchError || !reqData) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    if (reqData.receiver_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only the recipient can respond to this request' },
        { status: 403 }
      );
    }

    if (reqData.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'This request has already been responded to' },
        { status: 400 }
      );
    }

    if (newStatus === 'accepted') {
      // Insert bidirectional connections
      const { error: connErr1 } = await admin
        .from('connections')
        .insert({ user_id: reqData.sender_id, connected_user_id: reqData.receiver_id });

      const { error: connErr2 } = await admin
        .from('connections')
        .insert({ user_id: reqData.receiver_id, connected_user_id: reqData.sender_id });

      if (connErr1 || connErr2) throw connErr1 || connErr2;

      // Notify the sender that their request was accepted
      await admin
        .from('notifications')
        .insert({
          user_id: reqData.sender_id,
          type: 'connection_accepted',
          actor_id: user.id,
          reference_id: id,
        })
        .maybeSingle();
    }

    // Update request status
    const { data: updated, error: updateError } = await admin
      .from('connection_requests')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Connection request PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to respond to request' },
      { status: 500 }
    );
  }
}

// DELETE /api/connections/requests/[id] — cancel a sent request (sender only)
export async function DELETE(
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

    // Verify the user is the sender of this request
    const { data: reqData, error: fetchError } = await admin
      .from('connection_requests')
      .select('sender_id')
      .eq('id', id)
      .single();

    if (fetchError || !reqData) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    if (reqData.sender_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Only the sender can cancel this request' }, { status: 403 });
    }

    const { error } = await admin.from('connection_requests').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Request cancelled' });
  } catch (error) {
    console.error('Connection request DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel request' }, { status: 500 });
  }
}
