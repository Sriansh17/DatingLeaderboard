import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/payments/razorpay';

export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR' } = await request.json();

    if (!amount || amount < 100) {
      return NextResponse.json(
        { success: false, error: 'Amount must be at least 100 paise (₹1)' },
        { status: 400 }
      );
    }

    const order = await createRazorpayOrder({
      amount,
      currency,
      receipt: `loveboard_${Date.now()}`,
      notes: { source: 'loveboard_web' },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
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
