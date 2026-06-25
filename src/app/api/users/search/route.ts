import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/users/search?q=<query> — search users by username or full_name
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: users, error } = await admin
      .from('profiles')
      .select('id, username, full_name, avatar_url, city, bio')
      .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(20);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: users || [],
    });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
