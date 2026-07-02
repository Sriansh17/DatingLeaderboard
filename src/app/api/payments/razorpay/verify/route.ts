import { NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// POST /api/payments/razorpay/verify — verify payment and activate subscription
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, paymentId, signature, plan_id } = await request.json();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification fields' },
        { status: 400 }
      );
    }

    if (!plan_id) {
      return NextResponse.json(
        { success: false, error: 'Missing plan_id' },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Payment verified — create subscription record and activate premium
    const admin = createAdminClient();

    // Upsert subscription record
    const { error: subError } = await admin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_id,
        status: 'active',
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      });

    if (subError) {
      console.error('Subscription upsert error:', subError);
      // Don't fail the request — the payment is still valid
    }

    // Set is_premium on the user's profile
    const { error: profileError } = await admin
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Fetch the plan from constants for display
    const { SUBSCRIPTION_PLANS } = await import('@/lib/utils/constants');
    const plan = SUBSCRIPTION_PLANS[plan_id];

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        plan_id,
        plan_name: plan?.name || plan_id,
        is_premium: true,
        status: 'active',
      },
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
