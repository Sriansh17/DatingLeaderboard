import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ReactionType } from '@/types/database';

const VALID_REACTIONS: ReactionType[] = ['peek', 'spicy', 'relatable', 'dead', 'wholesome'];

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

    const body = await request.json();
    const { reaction } = body;

    // If reaction provided, validate it
    if (reaction && !VALID_REACTIONS.includes(reaction)) {
      return NextResponse.json({ success: false, error: 'Invalid reaction type' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check if user already has a reaction on this confession
    const { data: existing } = await admin
      .from('confession_reactions')
      .select('id, reaction')
      .eq('confession_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!reaction) {
      // No reaction provided — this shouldn't happen via the API, but handle gracefully
      return NextResponse.json({ success: false, error: 'Reaction type is required' }, { status: 400 });
    }

    if (existing) {
      if (existing.reaction === reaction) {
        // Same reaction tapped again — remove it (toggle off)
        const { error } = await admin
          .from('confession_reactions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        return NextResponse.json({ success: true, reaction: null });
      } else {
        // Different reaction — update
        const { error } = await admin
          .from('confession_reactions')
          .update({ reaction })
          .eq('id', existing.id);

        if (error) throw error;
        return NextResponse.json({ success: true, reaction });
      }
    } else {
      // No existing reaction — insert
      const { error } = await admin
        .from('confession_reactions')
        .insert({ confession_id: id, user_id: user.id, reaction });

      if (error) throw error;
      return NextResponse.json({ success: true, reaction });
    }
  } catch (error) {
    console.error('Confession react error:', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle reaction' }, { status: 500 });
  }
}
