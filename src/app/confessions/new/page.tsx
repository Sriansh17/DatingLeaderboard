'use client';

import { ConfessionForm } from '@/components/confessions/ConfessionForm';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewConfessionPage() {
  const router = useRouter();

  return (
    <main>
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors inline-flex items-center gap-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Feed
      </button>

      <ConfessionForm />
    </main>
  );
}
