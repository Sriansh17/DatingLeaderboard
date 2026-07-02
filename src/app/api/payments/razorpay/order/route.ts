import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_PLANS } from '@/lib/utils/constants';

export const dynamic = 'force-dynamic';

// POST /api/payments/razorpay/order — create a payment order for a subscription plan
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { plan_id } = await request.json();

    if (!plan_id || !SUBSCRIPTION_PLANS[plan_id]) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing plan_id. Valid plans: ' + Object.keys(SUBSCRIPTION_PLANS).join(', ') },
        { status: 400 }
      );
    }

    const plan = SUBSCRIPTION_PLANS[plan_id];

    if (plan.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Free plans cannot be purchased' },
        { status: 400 }
      );
    }

    const order = await createRazorpayOrder({
      amount: plan.price,
      currency: plan.currency,
      receipt: `fond_${plan_id}_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        source: 'fond_web',
        plan_id,
        user_id: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        plan_id,
      },
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
