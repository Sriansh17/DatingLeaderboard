'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { PartnerForm } from '@/components/partners/PartnerForm';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPartnerPage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) return null;

  return (
    <main className="max-w-2xl mx-auto px-5 py-6 min-h-screen">
      <Link
        href="/profile"
        className="mb-4 rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors inline-flex items-center gap-2"
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
