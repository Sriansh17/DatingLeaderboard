import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  try {
    // Use service role to bypass RLS for public posts feed
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('posts')
      .select('*, partner:partners!partner_id(*), profile:profiles!user_id(*)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Explore API] Supabase error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`[Explore API] Fetched ${data?.length || 0} posts in ${Date.now() - start}ms`);
    if (data && data.length > 0) {
      console.log(`[Explore API] Latest post: "${data[0].description}" | created: ${data[0].created_at} | score: ${data[0].ai_score}`);
    }
    return NextResponse.json({ success: true, data: data || [] }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[Explore API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}
