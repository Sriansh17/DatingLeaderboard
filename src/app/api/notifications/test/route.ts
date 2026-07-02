import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const admin = createAdminClient();

    // Get first real user to assign notifications to
    const { data: users } = await admin.from('profiles').select('id').limit(1);
    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: 'No users found' }, { status: 404 });
    }
    const targetUserId = users[0].id;

    // Find some other users to act as senders
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, username')
      .neq('id', targetUserId)
      .limit(5);

    const TYPES = ['post_like', 'post_comment', 'connection_request', 'connection_accepted', 'clique_invite'];

    if (!profiles || profiles.length === 0) {
      const inserts = TYPES.map(type => ({ user_id: targetUserId, actor_id: targetUserId, type }));
      const { error } = await admin.from('notifications').insert(inserts);
      if (error) throw error;
    } else {
      const inserts = TYPES.map((type, i) => ({
        user_id: targetUserId,
        actor_id: profiles[i % profiles.length].id,
        type,
      }));
      const { error } = await admin.from('notifications').insert(inserts);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: '5 sample notifications created for the first user. Sign in and refresh to see them.' });
  } catch (error) {
    console.error('Test notifications error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create test notifications' }, { status: 500 });
  }
}
