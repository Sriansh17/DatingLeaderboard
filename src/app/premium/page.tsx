'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/components/providers/AuthProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Confetti } from '@/components/ui/Confetti';
import { SUBSCRIPTION_PLANS } from '@/lib/utils/constants';
import { Check, X, Crown, Sparkles, ArrowLeft, LogIn, Shield, Zap, Infinity, Users, Edit3, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLAN_ICONS: Record<string, typeof Crown> = {
  free: Star,
  premium_monthly: Crown,
  premium_yearly: Zap,
};

export default function PremiumPage() {
  const { user, profile, refreshProfile } = useUser();
  const router = useRouter();
  const { addToast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const [activePlan, setActivePlan] = useState<string | null>(null);

  // Check if user already has premium
  useEffect(() => {
    if (profile?.is_premium) {
      checkActivePlan();
    }
  }, [profile]);

  const checkActivePlan = async () => {
    try {
      const res = await fetch('/api/users/me');
      // Just infer from profile
      setActivePlan('premium_monthly');
    } catch {
      // silently fail
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/auth/login?redirect=/premium');
      return;
    }

    if (profile?.is_premium) {
      addToast('You\'re already on Premium!', 'info');
      return;
    }

    setLoadingPlan(planId);
    setPaymentState('processing');

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        addToast(orderData.error || 'Failed to create order', 'error');
        setPaymentState('idle');
        setLoadingPlan(null);
        return;
      }

      const order = orderData.data;

      // 2. Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        addToast('Failed to load payment gateway. Please try again.', 'error');
        setPaymentState('idle');
        setLoadingPlan(null);
        return;
      }

      // 3. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Fond',
        description: SUBSCRIPTION_PLANS[planId]?.name || 'Premium Subscription',
        order_id: order.id,
        prefill: {
          name: profile?.full_name || profile?.username || '',
          email: user.email,
        },
        theme: {
          color: '#D12F58', // primary rose
        },
        modal: {
          ondismiss: () => {
            addToast('Payment cancelled. No charges made.', 'info');
            setPaymentState('idle');
            setLoadingPlan(null);
          },
        },
        handler: async function (response: any) {
          // 4. Verify payment
          try {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan_id: planId,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setPaymentState('success');
              setShowConfetti(true);
              await refreshProfile();
              addToast('Welcome to Premium! 🎉', 'success');
              setTimeout(() => setShowConfetti(false), 4000);
            } else {
              addToast(
                'Payment received but verification failed. Your payment ID: ' + response.razorpay_payment_id + '. Contact support.',
                'error'
              );
              setPaymentState('idle');
            }
          } catch {
            addToast(
              'Payment was processed but we couldn\'t verify it. Your payment ID: ' + response.razorpay_payment_id + '. Please contact support.',
              'error'
            );
            setPaymentState('idle');
          }
          setLoadingPlan(null);
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      addToast('Something went wrong. Please try again.', 'error');
      setPaymentState('idle');
      setLoadingPlan(null);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const plans = [SUBSCRIPTION_PLANS.FREE, SUBSCRIPTION_PLANS.PREMIUM_MONTHLY, SUBSCRIPTION_PLANS.PREMIUM_YEARLY];

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Crown className="h-16 w-16 text-gold mx-auto mb-4" />
        <h1 className="font-display text-4xl italic text-foreground mb-3">Go Premium</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Sign in to unlock the full Fond experience — unlimited posts, deeper insights, and more.
        </p>
        <Link href="/auth/login?redirect=/premium">
          <Button variant="primary" size="lg">
            <LogIn className="h-4 w-4" /> Sign In
          </Button>
        </Link>
      </div>
    );
  }

  // Already premium state
  if (profile?.is_premium || paymentState === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Confetti active={showConfetti} />
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-display text-3xl italic text-foreground mb-2">You&apos;re Premium!</h1>
          <p className="text-muted-foreground">
            {paymentState === 'success'
              ? 'Your subscription is now active. Enjoy the full Fond experience!'
              : 'Thank you for being a valued Premium member.'}
          </p>
        </div>

        {/* Features unlocked */}
        <Card className="mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" /> Premium Features
          </h2>
          <div className="space-y-3">
            {SUBSCRIPTION_PLANS.PREMIUM_MONTHLY.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-success" />
                </div>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline">Manage Subscription</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Confetti active={showConfetti} />

      {/* Back link */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-primary flex items-center justify-center mx-auto mb-4 shadow-md">
          <Crown className="h-7 w-7 text-white" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-2">Membership</p>
        <h1 className="font-display text-4xl italic text-foreground mb-2">Unlock the Full Fond</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Go Premium for unlimited posts, unlimited partners, and the complete Fond experience.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-4 lg:gap-6 mb-12">
        {plans.map((plan, index) => {
          const Icon = PLAN_ICONS[plan.id] || Star;
          const isFree = plan.id === 'free';
          const isPopular = plan.popular;
          const isYearly = plan.id === 'premium_yearly';

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-3xl border p-6 transition-all ${
                isPopular
                  ? 'border-primary shadow-[0_0_30px_-8px_rgba(209,47,88,0.3)] dark:shadow-[0_0_40px_-12px_rgba(209,47,88,0.2)] bg-card scale-105 md:scale-110 z-10'
                  : 'border-border bg-card/60 hover:border-primary/30'
              }`}
            >
              {/* Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="info">Most Popular</Badge>
                </div>
              )}
              {isYearly && !isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="success">Best Value</Badge>
                </div>
              )}

              {/* Icon + Name */}
              <div className={`text-center mb-4 ${isPopular ? 'mt-2' : ''}`}>
                <Icon className={`h-8 w-8 mx-auto mb-2 ${isFree ? 'text-muted-foreground' : 'text-gold'}`} />
                <h3 className="font-display text-xl italic text-foreground">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                {isFree ? (
                  <div className="font-score text-3xl text-muted-foreground">Free</div>
                ) : (
                  <>
                    <div className="font-score text-3xl text-foreground">{plan.priceDisplay}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {plan.period}
                      {isYearly && (
                        <span className="text-success ml-1 font-medium">(save ₹1,089/yr)</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2.5 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    {isFree ? (
                      <X className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                    ) : (
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    )}
                    <span className={isFree ? 'text-muted-foreground/60' : 'text-foreground/80'}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {!isFree && (
                <Button
                  variant={isPopular ? 'primary' : 'outline'}
                  size="lg"
                  className="w-full"
                  onClick={() => handleSubscribe(plan.id)}
                  loading={loadingPlan === plan.id}
                  disabled={paymentState === 'processing'}
                >
                  {loadingPlan === plan.id ? 'Processing…' : `Subscribe ${plan.period}`}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <Card className="mb-8">
        <h2 className="font-semibold text-foreground mb-4 text-center">Everything included</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 text-muted-foreground font-medium">Feature</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">Free</th>
                <th className="text-center py-3 px-4 text-primary font-medium">Premium</th>
                <th className="text-center py-3 pl-4 text-primary font-medium">Premium Yearly</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Daily posts', free: '2 per day', premium: 'Unlimited', yearly: 'Unlimited' },
                { feature: 'Partners', free: '1 max', premium: 'Unlimited', yearly: 'Unlimited' },
                { feature: 'Edit posts', free: '✗', premium: '✓', yearly: '✓' },
                { feature: 'Extended profiles', free: '✗', premium: '✓', yearly: '✓' },
                { feature: 'Priority support', free: '✗', premium: '✓', yearly: '✓' },
                { feature: 'Ad-free', free: '✗', premium: '✓', yearly: '✓' },
                { feature: 'Streak freeze', free: '✗', premium: '✗', yearly: '✓' },
                { feature: 'Early access', free: '✗', premium: '✗', yearly: '✓' },
                { feature: 'Exclusive badge', free: '✗', premium: '✗', yearly: '✓' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pr-4 text-foreground">{row.feature}</td>
                  <td className="text-center py-3 px-4 text-muted-foreground">{row.free}</td>
                  <td className="text-center py-3 px-4 text-foreground">{row.premium}</td>
                  <td className="text-center py-3 pl-4 text-foreground">{row.yearly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* FAQ */}
      <Card>
        <h2 className="font-semibold text-foreground mb-4 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What happens when I cancel?', a: 'Your Premium features will remain active until the end of your current billing period. After that, you\'ll revert to the Free plan.' },
            { q: 'Can I switch plans?', a: 'Yes! You can switch between Premium Monthly and Premium Yearly at any time. Contact support for assistance.' },
            { q: 'Is my payment secure?', a: 'Absolutely. All payments are processed securely through Razorpay, a PCI-DSS compliant payment gateway. We never store your card details.' },
            { q: 'Can I get a refund?', a: 'We offer a 7-day money-back guarantee. If you\'re not satisfied, contact us and we\'ll refund your first payment.' },
          ].map((faq, i) => (
            <details key={i} className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground py-2 list-none">
                {faq.q}
                <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-sm text-muted-foreground mt-2 pb-2">{faq.a}</p>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
