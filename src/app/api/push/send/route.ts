import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const adminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify sender is admin
    const { data: profile } = await adminClient()
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { title, body, url = '/', target = 'all' } = await request.json();
    if (!title || !body) {
      return NextResponse.json({ success: false, error: 'title and body are required' }, { status: 400 });
    }

    // Fetch subscriptions based on target
    let query = adminClient().from('push_subscriptions').select('*');

    if (target === 'premium') {
      // Join-style: get user_ids of premium users first
      const { data: premiumProfiles } = await adminClient()
        .from('profiles')
        .select('id')
        .eq('is_premium', true);
      const premiumIds = (premiumProfiles || []).map((p: { id: string }) => p.id);
      if (premiumIds.length === 0) {
        return NextResponse.json({ success: true, sent: 0, failed: 0 });
      }
      query = query.in('user_id', premiumIds);
    } else if (target !== 'all') {
      // specific user_id
      query = query.eq('user_id', target);
    }

    const { data: subscriptions, error: subError } = await query;
    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, sent: 0, failed: 0, message: 'No subscribers found for target.' });
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
    });

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub: { endpoint: string; p256dh: string; auth: string }) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          sent++;
        } catch (err: any) {
          failed++;
          // 410 Gone = subscription expired, clean it up
          if (err.statusCode === 410) {
            expiredEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await adminClient()
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    console.error('[push/send] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notifications' }, { status: 500 });
  }
}
