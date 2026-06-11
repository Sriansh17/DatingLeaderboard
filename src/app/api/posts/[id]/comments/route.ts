import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    const { data, error } = await admin
      .from('comments')
      .select('*, profile:profiles!user_id(username, full_name, avatar_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Comments GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch comments' }, { status: 500 });
  }
}

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

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from('comments')
      .insert({ post_id: id, user_id: user.id, content: content.trim() })
      .select('*, profile:profiles!user_id(username, full_name, avatar_url)')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Comment POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create comment' }, { status: 500 });
  }
}
