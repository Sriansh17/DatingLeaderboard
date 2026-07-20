import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/connections/requests — get incoming + outgoing requests
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: incoming, error: err1 } = await admin
      .from('connection_requests')
      .select('*, sender:sender_id(id, username, full_name, avatar_url, city)')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    const { data: outgoing, error: err2 } = await admin
      .from('connection_requests')
      .select('*, receiver:receiver_id(id, username, full_name, avatar_url, city)')
      .eq('sender_id', user.id)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false });

    if (err1 || err2) throw err1 || err2;

    return NextResponse.json({
      success: true,
      data: { incoming: incoming || [], outgoing: outgoing || [] },
    });
  } catch (error) {
    console.error('Connection requests GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST /api/connections/requests — send a connection request
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { receiver_id } = await request.json();
    if (!receiver_id) {
      return NextResponse.json({ success: false, error: 'Missing receiver_id' }, { status: 400 });
    }

    if (receiver_id === user.id) {
      return NextResponse.json({ success: false, error: 'Cannot send request to yourself' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check if already connected
    const { data: existing } = await admin
      .from('connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('connected_user_id', receiver_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: 'Already connected' }, { status: 400 });
    }

    // Check for existing pending request
    const { data: pending } = await admin
      .from('connection_requests')
      .select('id, status')
      .eq('sender_id', user.id)
      .eq('receiver_id', receiver_id)
      .eq('status', 'pending')
      .maybeSingle();

    if (pending) {
      return NextResponse.json({ success: false, error: 'Request already sent' }, { status: 400 });
    }

    // Create request
    const { data: requestData, error } = await admin
      .from('connection_requests')
      .insert({ sender_id: user.id, receiver_id })
      .select('*, receiver:receiver_id(id, username, full_name, avatar_url)')
      .single();

    if (error) throw error;

    // Create notification for receiver
    await admin
      .from('notifications')
      .insert({
        user_id: receiver_id,
        type: 'connection_request',
        actor_id: user.id,
        reference_id: requestData.id,
      })
      .maybeSingle();

    return NextResponse.json({ success: true, data: requestData });
  } catch (error) {
    console.error('Connection request POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send request' },
      { status: 500 }
    );
  }
}
