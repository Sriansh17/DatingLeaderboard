import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    // Read current views_count and increment
    const { data: post, error: fetchError } = await admin
      .from('posts')
      .select('views_count')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('[View API] Fetch error:', fetchError);
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    const currentViews = (post?.views_count || 0) + 1;

    const { error: updateError } = await admin
      .from('posts')
      .update({ views_count: currentViews })
      .eq('id', id);

    if (updateError) {
      console.error('[View API] Update error:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, views_count: currentViews });
  } catch (error) {
    console.error('[View API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record view' }, { status: 500 });
  }
}
