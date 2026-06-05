import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get post count and average score
    const { data: posts } = await supabase
      .from('posts')
      .select('ai_score')
      .eq('user_id', user.id)
      .not('ai_score', 'is', null);

    const postCount = posts?.length || 0;
    const avgScore = postCount > 0
      ? Math.round(posts!.reduce((a, b) => a + b.ai_score!, 0) / postCount)
      : 0;

    // Get partner count
    const { count: partnerCount } = await supabase
      .from('partners')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      data: {
        post_count: postCount,
        average_score: avgScore,
        partner_count: partnerCount || 0,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
