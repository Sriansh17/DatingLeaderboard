'use client';

import { ConfessionForm } from '@/components/confessions/ConfessionForm';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewConfessionPage() {
  const router = useRouter();

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-8 py-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 rounded-full glass-btn px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2 touch-target"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Feed
      </button>

      <ConfessionForm />
    </main>
  );
}
