import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { POSTS_PER_PAGE } from '@/lib/utils/constants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || String(POSTS_PER_PAGE));
    const start = (page - 1) * limit;

    const supabase = await createServerSupabaseClient();

    const { data, error, count } = await supabase
      .from('posts')
      .select('*, partner:partners(*), profile:profiles(*)', { count: 'exact' })
      .eq('is_public', true)
      .not('ai_score', 'is', null)
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > start + limit,
    });
  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch feed' }, { status: 500 });
  }
}
