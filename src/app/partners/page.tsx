'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { PartnerCard } from '@/components/partners/PartnerCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import type { Partner } from '@/types/database';
import { Heart, PlusCircle } from 'lucide-react';

export default function PartnersPage() {
  const { user } = useUser();
  const { addToast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPartners = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setPartners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPartners();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this partner?')) return;
    const supabase = createClient();
    await supabase.from('partners').delete().eq('id', id);
    addToast('Partner removed', 'info');
    loadPartners();
  };

  if (loading) return <Spinner size="lg" className="mx-auto mt-20" />;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Partners</h1>
          <p className="text-sm text-gray-500">Add and manage your loved ones</p>
        </div>
        <Link href="/partners/new">
          <Button size="sm">
            <PlusCircle className="h-4 w-4" />
            Add
          </Button>
        </Link>
      </div>

      {partners.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-pink-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No partners yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add your partner to start posting!</p>
          <Link href="/partners/new">
            <Button>Add Your Partner 💕</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
