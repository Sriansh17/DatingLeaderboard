import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/notifications/unread-count — get count of unread notifications
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { count, error } = await admin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { count: count || 0 },
    });
  } catch (error) {
    console.error('Unread count error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get unread count' },
      { status: 500 }
    );
  }
}
