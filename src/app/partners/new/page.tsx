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
    <div className="max-w-lg mx-auto">
      <Link
        href="/partners"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-pink-500 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Partners
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Add a Partner 💕</h1>
      <p className="text-sm text-gray-500 mb-6">Tell us about your special someone</p>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <PartnerForm
          userId={user.id}
          onSuccess={() => router.push('/partners')}
        />
      </div>
    </div>
  );
}
