import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Partners GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, relationship, emoji, avatar_url } = await request.json();

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    // Free users can only have one partner. Premium users can add multiple.
    const [{ data: profile, error: profileError }, { count: partnerCount, error: partnerCountError }] = await Promise.all([
      supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single(),
      supabase
        .from('partners')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

    if (profileError && (profileError as any).code !== 'PGRST116') throw profileError;
    if (partnerCountError) throw partnerCountError;

    if (!profile?.is_premium && (partnerCount || 0) >= 1) {
      return NextResponse.json(
        {
          success: false,
          code: 'PREMIUM_REQUIRED',
          error: 'Adding multiple partners is a premium feature. Upgrade to premium to add more partners.',
        },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('partners')
      .insert({
        user_id: user.id,
        name,
        relationship: relationship || 'partner',
        emoji: emoji || '💖',
        avatar_url: avatar_url || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Partners POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create partner' }, { status: 500 });
  }
}
