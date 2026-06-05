'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { PostForm } from '@/components/posts/PostForm';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import type { Partner } from '@/types/database';
import { Heart, ArrowLeft } from 'lucide-react';

export default function NewPostPage() {
  const { user } = useUser();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

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
  if (loading) return <Spinner size="lg" className="mx-auto mt-20" />;

  if (partners.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <Heart className="h-12 w-12 text-pink-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Add a Partner First</h2>
        <p className="text-gray-500 mb-6">You need to add a partner before you can create appreciation posts!</p>
        <Link href="/partners/new">
          <Button>Add Your Partner 💕</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-pink-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
          What did your partner do today? 💕
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Describe their gesture and our AI will score it!
        </p>
      </div>

      <PostForm partners={partners} userId={user.id} />
    </div>
  );
}
