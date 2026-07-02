'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { PartnerForm } from '@/components/partners/PartnerForm';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PremiumLaunchModal } from '@/components/ui/PremiumLaunchModal';
import { createClient } from '@/lib/supabase/client';

export default function NewPartnerPage() {
  const { user, profile } = useUser();
  const router = useRouter();
  const [partnerCount, setPartnerCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from('partners')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => {
        setPartnerCount(count || 0);
        setLoadingCount(false);
      });
  }, [user]);

  const isPremium = !!profile?.is_premium;
  const blockedByPlan = !isPremium && partnerCount >= 1;

  const handleUpgrade = () => {
    setShowPremiumModal(true);
  };

  if (!user) return null;

  if (loadingCount) return null;

  if (blockedByPlan) {
    return (
      <main className="max-w-2xl mx-auto px-5 py-6 min-h-dvh">
        <Link
          href="/profile"
          className="mb-4 rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 active:bg-elevated transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Profile
        </Link>

        <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/10 p-6">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gold mb-2">Premium required</p>
          <h1 className="font-display text-2xl italic text-foreground mb-2">Multiple Partners</h1>
          <p className="text-sm text-foreground/90 mb-5">
            Free plan supports one partner. Upgrade to premium to add multiple partners.
          </p>
          <button
            onClick={handleUpgrade}
            className="rounded-full bg-gold/90 hover:bg-gold active:bg-gold/80 px-6 py-3 text-xs font-semibold text-black transition-colors touch-target"
          >
            Upgrade to Premium
          </button>
        </div>
        <PremiumLaunchModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          source="partners-new"
        />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-5 py-6 min-h-dvh">
      <Link
        href="/profile"
        className="mb-4 rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 active:bg-elevated transition-colors inline-flex items-center gap-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Profile
      </Link>

      <p className="text-xs uppercase tracking-[0.25em] text-gold mt-6">Step 1 of 1</p>
      <h1 className="mt-1 font-display text-3xl italic leading-tight text-foreground">Add a Partner 💕</h1>
      <p className="mt-2 text-sm text-muted-foreground mb-8">Tell us about your special someone before you submit a verdict.</p>

      <div className="mt-8">
        <PartnerForm
          userId={user.id}
          onSuccess={() => router.push('/profile')}
        />
      </div>
    </main>
  );
}
