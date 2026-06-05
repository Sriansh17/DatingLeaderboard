import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { scorePost } from '@/lib/ai/scoring';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*, partner:partners(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Posts GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { partner_id, description, is_public } = await request.json();

    if (!partner_id || !description) {
      return NextResponse.json(
        { success: false, error: 'partner_id and description are required' },
        { status: 400 }
      );
    }

    // Get AI score
    const aiResult = await scorePost(description);

    if (aiResult.flagged) {
      return NextResponse.json(
        { success: false, flagged: true, error: aiResult.flag_reason || 'This post was flagged as invalid or unrealistic.' },
        { status: 400 }
      );
    }

    // Create post
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        partner_id,
        description,
        is_public: is_public ?? true,
        ai_score: aiResult.score,
        ai_feedback: aiResult.feedback,
        ai_explanation: JSON.stringify(aiResult.breakdown),
      })
      .select('*, partner:partners(*)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data, aiResult }, { status: 201 });
  } catch (error) {
    console.error('Posts POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
  }
}
