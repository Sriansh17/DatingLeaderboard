import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/notifications — list current user's notifications (deduplicated, unread first)
export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;

    const admin = createAdminClient();

    // Fetch all notifications (unread first, then newest)
    const { data: notifications, error, count } = await admin
      .from('notifications')
      .select('*, actor:actor_id(id, username, full_name, avatar_url)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('read', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // --- Deduplication ---
    // For same (type, reference_id, actor_id), keep the newest only.
    // For like/comment notifications, group by type+reference_id:
    // "X and Y liked your post" instead of two separate entries.
    const seen = new Map<string, number>();
    const deduped: any[] = [];

    for (const n of (notifications || [])) {
      const key = `${n.type}:${n.reference_id || ''}:${n.actor_id || ''}`;
      // Only dedup for event-type notifications (post_like, post_comment, etc.)
      // Connection requests and clique invites should NOT be deduped by actor
      const shouldDedup = ['post_like', 'post_comment', 'mention'].includes(n.type);

      if (shouldDedup) {
        const groupKey = `${n.type}:${n.reference_id || ''}`;
        const existingIdx = seen.get(groupKey);

        if (existingIdx !== undefined) {
          // Add this actor to the existing notification's grouped actors
          if (!deduped[existingIdx]._groupedActors) {
            deduped[existingIdx]._groupedActors = [{
              id: deduped[existingIdx].actor_id,
              username: deduped[existingIdx].actor?.username,
            }];
          }
          // Avoid adding the same actor twice
          const alreadyGrouped = deduped[existingIdx]._groupedActors.some(
            (a: any) => a.id === n.actor_id
          );
          if (!alreadyGrouped) {
            deduped[existingIdx]._groupedActors.push({
              id: n.actor_id,
              username: n.actor?.username,
            });
          }
          // Keep the unread status (most recent read=false wins)
          if (!n.read) deduped[existingIdx].read = false;
          continue;
        }
        seen.set(groupKey, deduped.length);
      }

      deduped.push({ ...n });
    }

    // Apply pagination AFTER dedup
    const paginated = deduped.slice(offset, offset + limit);
    const totalAfterDedup = deduped.length;

    return NextResponse.json({
      success: true,
      data: paginated || [],
      total: totalAfterDedup,
      page,
      limit,
      has_more: (offset + limit) < totalAfterDedup,
    });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
