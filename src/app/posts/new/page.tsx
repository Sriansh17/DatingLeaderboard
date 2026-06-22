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
  const { user, profile } = useUser();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [postCountToday, setPostCountToday] = useState(0);
  const [isPremiumLocal, setIsPremiumLocal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsPremiumLocal(!!profile?.is_premium);
  }, [profile?.is_premium]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    Promise.all([
      supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true),
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfToday.toISOString()),
    ]).then(([partnersRes, postsRes]) => {
        setPartners(partnersRes.data || []);
        setPostCountToday(postsRes.count || 0);
        setLoading(false);
      });
  }, [user]);

  const isPremium = isPremiumLocal;
  const postLimitReached = !isPremiumLocal && postCountToday >= 2;

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
        className="mb-4 rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors inline-flex items-center gap-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Cancel
      </button>

      <PostForm
        partners={partners}
        userId={user.id}
        isPremium={isPremium}
        postCount={postCountToday}
        postLimitReached={postLimitReached}
        onUpgradedToPremium={() => setIsPremiumLocal(true)}
      />
    </main>
  );
}
