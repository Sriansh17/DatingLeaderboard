'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { PostForm } from '@/components/posts/PostForm';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import type { Partner } from '@/types/database';
import { Heart, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  const { user } = useUser();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .then(({ data }) => {
        setPartners(data || []);
        setLoading(false);
      });
  }, [user]);

  if (!user) return null;
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-20 text-center animate-pulse">
        <div className="h-8 w-48 bg-elevated rounded-full mx-auto mb-4" />
        <div className="h-4 w-32 bg-elevated rounded-full mx-auto" />
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-4">
        <Heart className="h-12 w-12 text-blush mx-auto mb-4" />
        <h2 className="text-xl font-display italic text-foreground mb-2">Add a Partner First</h2>
        <p className="text-muted-foreground mb-6 text-sm">You need to add a partner before you can create appreciation posts!</p>
        <Link href="/partners/new">
          <button className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]">
            Add Your Partner 💕
          </button>
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-5 py-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Cancel
      </button>

      <PostForm partners={partners} userId={user.id} />
    </main>
  );
}
