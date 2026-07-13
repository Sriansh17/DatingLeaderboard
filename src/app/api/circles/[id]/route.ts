import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/circles/[id] — get circle details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    const { data, error } = await admin
      .from('circles')
      .select(`
        *,
        creator:profiles!created_by(id, username, full_name, avatar_url),
        members:circle_members(
          id, user_id, role, status, joined_at,
          profile:profiles(id, username, full_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Bond not found' }, { status: 404 });
      }
      throw error;
    }

    const enriched = {
      ...data,
      member_count: (data as any).members?.filter((m: any) => m.status === 'active').length || 0,
    };

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Circle GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bond' }, { status: 500 });
  }
}

// DELETE /api/circles/[id] — delete a circle (creator only)
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

    // Verify user is the creator
    const { data: circle } = await admin
      .from('circles')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!circle) {
      return NextResponse.json({ success: false, error: 'Bond not found' }, { status: 404 });
    }

    if (circle.created_by !== user.id) {
      return NextResponse.json({ success: false, error: 'Only the creator can delete this bond' }, { status: 403 });
    }

    // Delete circle (cascade deletes members)
    const { error } = await admin.from('circles').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Bond deleted' });
  } catch (error) {
    console.error('Circle DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete bond' }, { status: 500 });
  }
}
