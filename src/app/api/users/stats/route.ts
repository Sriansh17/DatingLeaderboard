import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

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

    // Calculate global rank
    let rank = null;
    if (avgScore > 0) {
      const admin = createAdminClient();
      const { data: allScores } = await admin
        .from('posts')
        .select('user_id, ai_score')
        .not('ai_score', 'is', null);

      if (allScores) {
        const userAvgs: Record<string, number[]> = {};
        allScores.forEach(p => {
          if (!userAvgs[p.user_id]) userAvgs[p.user_id] = [];
          userAvgs[p.user_id].push(p.ai_score!);
        });
        const avgMap: Record<string, number> = {};
        Object.entries(userAvgs).forEach(([uid, scores]) => {
          avgMap[uid] = scores.reduce((a, b) => a + b, 0) / scores.length;
        });
        const sorted = Object.entries(avgMap).sort(([, a], [, b]) => b - a);
        const pos = sorted.findIndex(([uid]) => uid === user.id);
        rank = pos >= 0 ? pos + 1 : null;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        post_count: postCount,
        average_score: avgScore,
        partner_count: partnerCount || 0,
        rank,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
