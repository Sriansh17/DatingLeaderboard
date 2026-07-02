import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// POST /api/circles/join — join a circle via invite code
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { code, passcode } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Invite code is required' }, { status: 400 });
    }

    // Use admin client to bypass RLS
    const admin = createAdminClient();

    // Find the circle by code
    const { data: circle, error: circleError } = await admin
      .from('circles')
      .select('*')
      .eq('code', code.toLowerCase())
      .single();

    if (circleError || !circle) {
      return NextResponse.json({ success: false, error: 'Invalid invite code' }, { status: 404 });
    }

    // Check if invite has expired
    if (circle.invite_expires_at && new Date(circle.invite_expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'This invite link has expired. Ask the creator for a new one.',
        expired: true,
      }, { status: 400 });
    }

    // Check if a passcode is required
    if (circle.passcode) {
      // If no passcode provided, tell the frontend one is needed
      if (!passcode) {
        return NextResponse.json({
          success: false,
          error: 'This bond requires a passcode to join.',
          needs_passcode: true,
          circle_name: circle.name,
        }, { status: 400 });
      }
      // Verify passcode
      if (passcode !== circle.passcode) {
        return NextResponse.json({
          success: false,
          error: 'Incorrect passcode. Try again.',
          needs_passcode: true,
          circle_name: circle.name,
        }, { status: 400 });
      }
    }

    // Check if user is already a member
    const { data: existing } = await admin
      .from('circle_members')
      .select('id')
      .eq('circle_id', circle.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: 'You are already a member of this bond' }, { status: 409 });
    }

    // Check member count
    const { count } = await admin
      .from('circle_members')
      .select('*', { count: 'exact', head: true })
      .eq('circle_id', circle.id);

    if (count && count >= circle.max_members) {
      return NextResponse.json({ success: false, error: `Bond is full (max ${circle.max_members} members)` }, { status: 400 });
    }

    // Add member
    const { error: joinError } = await admin
      .from('circle_members')
      .insert({ circle_id: circle.id, user_id: user.id, role: 'member' });

    if (joinError) throw joinError;

    // Notify the circle creator
    await admin
      .from('notifications')
      .insert({
        user_id: circle.created_by,
        type: 'clique_joined',
        actor_id: user.id,
        reference_id: circle.id,
      })
      .maybeSingle();

    return NextResponse.json({ success: true, data: circle });
  } catch (error) {
    console.error('Circle join error:', error);
    return NextResponse.json({ success: false, error: 'Failed to join bond' }, { status: 500 });
  }
}
