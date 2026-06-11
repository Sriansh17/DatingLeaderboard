import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const CIRCLE_CODE_LENGTH = 8;

function generateCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < CIRCLE_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET /api/circles — list circles the current user belongs to
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const admin = createAdminClient();

    const { data: memberships, error: membershipError } = await admin
      .from('circle_members')
      .select('circle_id')
      .eq('user_id', user.id);

    if (membershipError) throw membershipError;

    const circleIds = memberships?.map(m => m.circle_id) || [];

    if (circleIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await admin
      .from('circles')
      .select(`
        *,
        creator:profiles!created_by(id, username, full_name, avatar_url),
        members:circle_members(
          id, user_id, role, joined_at,
          profile:profiles(id, username, full_name, avatar_url)
        )
      `)
      .in('id', circleIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = (data || []).map((circle: any) => ({
      ...circle,
      member_count: circle.members?.length || 0,
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Circles GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch circles' }, { status: 500 });
  }
}

// POST /api/circles — create a new circle
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, emoji, passcode, expires_in_hours } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Circle name is required' }, { status: 400 });
    }

    // Calculate invite expiry (default 24 hours)
    const expiresInHours = typeof expires_in_hours === 'number' ? expires_in_hours : 24;
    const invite_expires_at = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

    // Use admin client to bypass RLS
    const admin = createAdminClient();

    // Generate unique invite code
    let code = generateCode();
    let codeExists = true;
    while (codeExists) {
      const { data: existing } = await admin
        .from('circles')
        .select('id')
        .eq('code', code)
        .maybeSingle();
      if (existing) {
        code = generateCode();
      } else {
        codeExists = false;
      }
    }

    // Create the circle
    const { data: circle, error: circleError } = await admin
      .from('circles')
      .insert({
        name: name.trim(),
        emoji: emoji || '💫',
        code,
        created_by: user.id,
        max_members: 10,
        invite_expires_at,
        passcode: passcode?.trim() || null,
      })
      .select()
      .single();

    if (circleError) throw circleError;

    // Add creator as the first member (role: creator)
    const { error: memberError } = await admin
      .from('circle_members')
      .insert({
        circle_id: circle.id,
        user_id: user.id,
        role: 'creator',
      });

    if (memberError) throw memberError;

    return NextResponse.json({
      success: true,
      data: { ...circle, code },
    }, { status: 201 });
  } catch (error) {
    console.error('Circle POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create circle' }, { status: 500 });
  }
}
