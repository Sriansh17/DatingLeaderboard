import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Generate a consistent anonymous identity per (confession_id, user_id) pair
const ANON_EMOJIS = ['🦊', '🐱', '🐼', '🐸', '🐨', '🦁', '🐯', '🐰', '🐙', '🦉', '🐺', '🐻'];
const ANON_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

function hashUserId(userId: string, confessionId: string): number {
  let hash = 0;
  const str = userId + confessionId;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getAnonymousIdentity(userId: string, confessionId: string) {
  const hash = hashUserId(userId, confessionId);
  return {
    emoji: ANON_EMOJIS[hash % ANON_EMOJIS.length],
    color: ANON_COLORS[hash % ANON_COLORS.length],
  };
}

// GET /api/confessions/[id]/replies — fetch replies for a confession
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('confession_replies')
      .select('*')
      .eq('confession_id', id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('[Replies API] Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Anonymize: attach consistent anonymous identity per user
    const anonymized = (data || []).map((reply: any) => ({
      ...reply,
      ...getAnonymousIdentity(reply.user_id, id),
      user_id: undefined, // Strip actual user ID
    }));

    return NextResponse.json({ success: true, data: anonymized });
  } catch (error) {
    console.error('[Replies API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch replies' }, { status: 500 });
  }
}

// POST /api/confessions/[id]/replies — create a reply
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
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    if (content.trim().length > 500) {
      return NextResponse.json({ success: false, error: 'Reply too long (max 500 chars)' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('confession_replies')
      .insert({
        confession_id: id,
        user_id: user.id,
        content: content.trim(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('[Replies API] Insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Anonymize response
    const reply = {
      ...data,
      ...getAnonymousIdentity(user.id, id),
      user_id: undefined,
    };

    return NextResponse.json({ success: true, data: reply }, { status: 201 });
  } catch (error) {
    console.error('[Replies API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create reply' }, { status: 500 });
  }
}
