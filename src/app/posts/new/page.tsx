'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { PostForm } from '@/components/posts/PostForm';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import type { Partner } from '@/types/database';
import { Heart, ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewPostPage() {
  const { user, profile } = useUser();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [postCountToday, setPostCountToday] = useState(0);
  const [isPremiumLocal, setIsPremiumLocal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstPostRequired = searchParams.get('first') === '1';

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
          <button className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] uppercase tracking-[0.2em]">
            Add Your Partner 💕
          </button>
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-5 py-6">
      {isFirstPostRequired && (
        <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Almost there</p>
          <p className="mt-1 text-sm text-foreground/90">
            Add your first post to customize your experience and finish setup.
          </p>
        </div>
      )}

      {/* Cancel + Premium status row */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Cancel
        </button>

        {isPremium && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gradient-to-r from-gold/10 to-gold/5 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-gold/90 shadow-[0_0_12px_-4px_rgba(199,169,107,0.2)]">
            <Sparkles className="h-3 w-3 text-gold" />
            Premium
          </div>
        )}
      </div>

      <PostForm
        partners={partners}
        userId={user.id}
        isPremium={isPremium}
        postLimitReached={postLimitReached}
        onUpgradedToPremium={() => setIsPremiumLocal(true)}
      />
    </main>
  );
}
