import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const WEEKLY_INSIGHT_PROMPT = `You are "Fond AI" — a warm, perceptive relationship analyst. You've been given a person's relationship posts from the past week. Each post describes something their partner did for them, along with an AI score (out of 100).

Based on these posts, write a SHORT relationship insight (2-3 sentences max). Be specific to their content — reference actual details from their posts. Identify a pattern, strength, or observation about their relationship dynamic.

Tone: warm, insightful, slightly poetic. Like a wise friend who notices things. NOT generic advice. NOT therapy. NOT preachy.

Examples of good insights:
- "Your relationship lives in the small moments — remembered preferences, quiet presence during stress. That's not boring, that's bedrock."
- "There's a clear pattern: your partner shows up hardest when you're vulnerable. That kind of attunement doesn't happen by accident."
- "This week was lighter — playful, spontaneous. Sometimes the best thing a relationship can do is just be fun."

If there's only 1 post, still give an insight based on what that single moment reveals.

Return ONLY a JSON object:
{
  "insight": "your 2-3 sentence insight here",
  "theme": "one word theme like: comfort, spontaneity, attunement, playfulness, growth, devotion, presence"
}`;

async function generateWeeklyInsight(posts: Array<{ description: string; ai_score: number | null }>): Promise<{ insight: string; theme: string }> {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey.includes('xxx')) {
      return { insight: 'Keep sharing moments — your story is still being written.', theme: 'growth' };
    }

    const postsContext = posts
      .map((p, i) => `${i + 1}. "${p.description}" (score: ${p.ai_score || 'unscored'})`)
      .join('\n');

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: WEEKLY_INSIGHT_PROMPT },
          { role: 'user', content: `Here are the posts from this week:\n\n${postsContext}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('[Weekly Insight] API error:', response.status);
      return { insight: 'Another week of love logged. The pattern is building.', theme: 'growth' };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { insight: 'Another week of love logged. The pattern is building.', theme: 'growth' };
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('[Weekly Insight] Error:', error);
    return { insight: 'Another week of love logged. The pattern is building.', theme: 'growth' };
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekOffset = parseInt(searchParams.get('week') || '0'); // 0 = last completed week, 1 = week before, etc.

    // Calculate the week boundaries (Mon-Sun)
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon...
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Start of current week (Monday 00:00 UTC)
    const currentWeekStart = new Date(now);
    currentWeekStart.setUTCDate(now.getUTCDate() - daysSinceMonday);
    currentWeekStart.setUTCHours(0, 0, 0, 0);

    // Target week start/end
    const weekStart = new Date(currentWeekStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - (7 * (weekOffset + 1)));
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

    const admin = createAdminClient();

    // Fetch user's posts from that week
    const { data: posts, error: postsError } = await admin
      .from('posts')
      .select('id, description, ai_score, ai_feedback, created_at, partner:partners!partner_id(name, emoji)')
      .eq('user_id', user.id)
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', weekEnd.toISOString())
      .order('ai_score', { ascending: false });

    if (postsError) throw postsError;

    // Fetch user's profile for streak/rank context
    const { data: profile } = await admin
      .from('profiles')
      .select('username, streak_count, longest_streak')
      .eq('id', user.id)
      .single();

    // Calculate stats
    const postCount = posts?.length || 0;
    const scoredPosts = (posts || []).filter(p => p.ai_score != null);
    const avgScore = scoredPosts.length > 0
      ? Math.round(scoredPosts.reduce((acc, p) => acc + (p.ai_score || 0), 0) / scoredPosts.length)
      : 0;
    const bestPost = scoredPosts[0] || null;
    const worstPost = scoredPosts.length > 0 ? scoredPosts[scoredPosts.length - 1] : null;

    // Compare to previous week
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);
    const { data: prevPosts } = await admin
      .from('posts')
      .select('ai_score')
      .eq('user_id', user.id)
      .gte('created_at', prevWeekStart.toISOString())
      .lt('created_at', weekStart.toISOString());

    const prevScoredPosts = (prevPosts || []).filter(p => p.ai_score != null);
    const prevAvgScore = prevScoredPosts.length > 0
      ? Math.round(prevScoredPosts.reduce((acc, p) => acc + (p.ai_score || 0), 0) / prevScoredPosts.length)
      : null;

    const scoreDelta = prevAvgScore !== null ? avgScore - prevAvgScore : null;

    // Generate AI insight if user had posts
    let aiInsight = null;
    if (postCount > 0 && scoredPosts.length > 0) {
      aiInsight = await generateWeeklyInsight(
        scoredPosts.map(p => ({ description: p.description, ai_score: p.ai_score }))
      );
    }

    // Format week label
    const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(weekEnd.getTime() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return NextResponse.json({
      success: true,
      data: {
        weekLabel,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        postCount,
        avgScore,
        scoreDelta,
        prevAvgScore,
        bestPost: bestPost ? {
          id: bestPost.id,
          description: bestPost.description?.slice(0, 120),
          score: bestPost.ai_score,
          feedback: bestPost.ai_feedback,
          partner: bestPost.partner,
        } : null,
        worstPost: worstPost && worstPost.id !== bestPost?.id ? {
          id: worstPost.id,
          score: worstPost.ai_score,
        } : null,
        streak: profile?.streak_count || 0,
        longestStreak: profile?.longest_streak || 0,
        aiInsight,
        posts: (posts || []).map(p => ({
          id: p.id,
          description: p.description?.slice(0, 80),
          score: p.ai_score,
          date: p.created_at,
          partner: p.partner,
        })),
      },
    });
  } catch (error) {
    console.error('[Weekly Summary] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate summary' }, { status: 500 });
  }
}
