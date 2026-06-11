import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/circles/[id]/leaderboard — get leaderboard for a circle
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    // Get all members of the circle
    const { data: members, error: membersError } = await admin
      .from('circle_members')
      .select('user_id, role, profile:profiles(id, username, full_name, avatar_url)')
      .eq('circle_id', id);

    if (membersError) throw membersError;

    if (!members || members.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const userIds = members.map(m => m.user_id);

    // Get avg score for each member from their public posts
    const { data: scores } = await admin
      .from('posts')
      .select('user_id, ai_score')
      .in('user_id', userIds)
      .not('ai_score', 'is', null)
      .is('is_public', true);

    // Calculate averages per user
    const scoreMap = new Map<string, { total: number; count: number }>();
    for (const post of scores || []) {
      const entry = scoreMap.get(post.user_id) || { total: 0, count: 0 };
      entry.total += post.ai_score!;
      entry.count += 1;
      scoreMap.set(post.user_id, entry);
    }

    // Build leaderboard entries
    const leaderboard = members
      .map((member) => {
        const stats = scoreMap.get(member.user_id);
        const avg = stats ? Math.round((stats.total / stats.count) * 10) / 10 : 0;
        return {
          user_id: member.user_id,
          username: (member.profile as any)?.username || 'unknown',
          full_name: (member.profile as any)?.full_name || null,
          avatar_url: (member.profile as any)?.avatar_url || null,
          role: member.role,
          average_score: avg,
          total_posts: stats?.count || 0,
        };
      })
      .sort((a, b) => b.average_score - a.average_score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Circle leaderboard error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
