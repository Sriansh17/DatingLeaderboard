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
      .select('user_id, ai_score, partner:partners!partner_id(name, emoji, avatar_url)')
      .in('user_id', userIds)
      .not('ai_score', 'is', null)
      .is('is_public', true)
      .order('ai_score', { ascending: false });

    // Calculate averages per user and find top partner
    const userStats = new Map<string, {
      total: number;
      count: number;
      topPartner: { name: string; emoji: string; avatar: string | null } | null;
    }>();

    for (const post of scores || []) {
      const uid = post.user_id;
      const entry = userStats.get(uid) || {
        total: 0,
        count: 0,
        topPartner: null,
      };
      entry.total += post.ai_score!;
      entry.count += 1;

      // First post or higher score — set as top partner
      const partner = post.partner as any;
      if (partner && !entry.topPartner) {
        entry.topPartner = {
          name: partner.name || 'Partner',
          emoji: partner.emoji || '💖',
          avatar: partner.avatar_url || null,
        };
      }
      userStats.set(uid, entry);
    }

    // Build leaderboard entries
    const leaderboard = members
      .map((member) => {
        const stats = userStats.get(member.user_id);
        const avg = stats ? Math.round((stats.total / stats.count) * 10) / 10 : 0;
        return {
          user_id: member.user_id,
          username: (member.profile as any)?.username || 'unknown',
          full_name: (member.profile as any)?.full_name || null,
          avatar_url: (member.profile as any)?.avatar_url || null,
          role: member.role,
          average_score: avg,
          total_posts: stats?.count || 0,
          top_partner_name: stats?.topPartner?.name || 'No partner',
          top_partner_emoji: stats?.topPartner?.emoji || '💖',
          top_partner_avatar: stats?.topPartner?.avatar || null,
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
