import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/connections — list current user's connections
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Fetch connections where user is either side
    const { data: connections, error } = await admin
      .from('connections')
      .select('id, user_id, connected_user_id, created_at, profile:connected_user_id(id, username, full_name, avatar_url, city)')
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: connections || [],
    });
  } catch (error) {
    console.error('Connections GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

// DELETE /api/connections — remove a connection
export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id: connectedUserId } = await request.json();
    if (!connectedUserId) {
      return NextResponse.json({ success: false, error: 'Missing user_id' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Delete both directional rows
    const { error: err1 } = await admin
      .from('connections')
      .delete()
      .eq('user_id', user.id)
      .eq('connected_user_id', connectedUserId);

    const { error: err2 } = await admin
      .from('connections')
      .delete()
      .eq('user_id', connectedUserId)
      .eq('connected_user_id', user.id);

    if (err1 || err2) throw err1 || err2;

    return NextResponse.json({ success: true, message: 'Connection removed' });
  } catch (error) {
    console.error('Connection DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove connection' },
      { status: 500 }
    );
  }
}
