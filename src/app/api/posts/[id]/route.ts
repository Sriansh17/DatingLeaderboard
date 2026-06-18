import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { scorePost } from '@/lib/ai/scoring';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Use service role to bypass RLS for reading post data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        partner:partners(*),
        profile:profiles(*),
        likes:likes(count),
        comments:comments(count)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
      }
      throw error;
    }

    // Flatten counts
    const enriched = {
      ...data,
      likes_count: (data as any).likes?.[0]?.count ?? 0,
      comments_count: (data as any).comments?.[0]?.count ?? 0,
      likes: undefined,
      comments: undefined,
    };

    // Check if current user liked this post
    try {
      const authSupabase = await createServerSupabaseClient();
      const { data: { user }, error: authError } = await authSupabase.auth.getUser();
      
      if (authError) {
        console.log('[Post GET] Auth error:', authError.message);
      }
      
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        (enriched as any).has_liked = !!likeData;
        console.log('[Post GET] User', user.id, 'has_liked:', !!likeData, 'for post', id);
      } else {
        console.log('[Post GET] No authenticated user');
      }
    } catch (err) {
      console.log('[Post GET] Auth check failed:', err);
      (enriched as any).has_liked = false;
    }

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Post GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PATCH(
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

    // Check premium status — editing posts requires premium
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    if (profileError && (profileError as any).code !== 'PGRST116') throw profileError;

    const body = await request.json();

    // Only the description edit requires premium; toggling is_archived does not
    const isArchiveToggle = Object.keys(body).length === 1 && 'is_archived' in body;

    if (!isArchiveToggle && !profile?.is_premium) {
      return NextResponse.json(
        {
          success: false,
          error: 'Editing posts is a premium feature. Upgrade to premium to edit your posts.',
          code: 'PREMIUM_REQUIRED',
        },
        { status: 403 }
      );
    }

    // If description is being changed, re-run AI scoring
    let aiFields: Record<string, unknown> = {};
    if (body.description) {
      const aiResult = await scorePost(body.description);
      if (aiResult.flagged) {
        return NextResponse.json(
          { success: false, flagged: true, error: aiResult.flag_reason || 'This post was flagged as invalid or unrealistic.' },
          { status: 400 }
        );
      }
      aiFields = {
        ai_score: aiResult.score,
        ai_feedback: aiResult.feedback,
        ai_explanation: JSON.stringify(aiResult.breakdown),
      };
    }

    const { data, error } = await supabase
      .from('posts')
      .update({ ...body, ...aiFields })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*, partner:partners(*)')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Post PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update post' }, { status: 500 });
  }
}

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

    // Archive instead of hard-delete
    const { error } = await supabase
      .from('posts')
      .update({ is_archived: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Post archived' });
  } catch (error) {
    console.error('Post archive error:', error);
    return NextResponse.json({ success: false, error: 'Failed to archive post' }, { status: 500 });
  }
}
