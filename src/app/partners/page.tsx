'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import type { Partner } from '@/types/database';
import { Plus, Edit3 } from 'lucide-react';
import { PageBell } from '@/components/ui/PageBell';
import { PartnerForm } from '@/components/partners/PartnerForm';

export default function PartnersPage() {
  const { user, profile, refreshProfile } = useUser();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const isPremium = !!profile?.is_premium;
  const canAddAnotherPartner = isPremium || partners.length === 0;

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_premium: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upgrade to premium');
      }
      await refreshProfile();
      addToast('Premium activated. You can now add multiple partners.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Upgrade failed. Please try again.', 'error');
    } finally {
      setUpgrading(false);
    }
  };

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

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!(await confirm({ title: 'Remove Partner', message: 'Remove this partner?', confirmLabel: 'Remove', variant: 'danger' }))) return;
    const supabase = createClient();
    await supabase.from('partners').delete().eq('id', id);
    addToast('Partner removed', 'info');
    loadPartners();
  };

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-transparent">
      <Spinner size="lg" text={["LOADING PARTNERS..."]} />
    </div>
  );

  return (
    <main className="min-h-screen bg-transparent py-16 px-6 relative">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Header Section */}
        <div className="w-full flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            My Person
          </p>
          <PageBell />
        </div>
        <h1 className="font-display text-5xl sm:text-6xl italic text-foreground mb-12">
          Partners
        </h1>

        {/* Partners Grid */}
        {partners.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-3xl">
            {partners.map((partner) => (
              <div 
                key={partner.id}
                className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-primary/20 transition-all duration-300 backdrop-blur-xl cursor-default shadow-sm hover:shadow-md"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{partner.emoji || '💖'}</span>
                <span className="font-medium text-foreground text-lg tracking-wide">{partner.name}</span>
                
                {/* Edit & Delete buttons (show on hover) */}
                <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingPartner(partner); setShowAddForm(true); }}
                    className="bg-primary hover:bg-primary/80 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    title="Edit Partner"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(partner.id, e)}
                    className="bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    title="Delete Partner"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-8 text-muted-foreground italic font-display text-xl">
            Your circle is currently empty.
          </div>
        )}

        {/* Add Partner Button */}
        {!showAddForm && canAddAnotherPartner && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground shadow-glow hover:opacity-90 transition-all text-sm font-bold uppercase tracking-[0.2em]"
          >
            <Plus className="w-5 h-5" />
            Add Partner
          </button>
        )}

        {!showAddForm && !canAddAnotherPartner && (
          <div className="text-center rounded-2xl border border-gold/30 bg-gold/10 px-6 py-5 max-w-xl w-full">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-gold mb-2">Premium required</p>
            <p className="text-sm text-foreground/90 mb-4">
              Free plan supports one partner. Upgrade to premium to add multiple partners.
            </p>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="rounded-full bg-gold/90 hover:bg-gold px-5 py-2 text-xs font-semibold text-black transition-colors disabled:opacity-60"
            >
              {upgrading ? 'Upgrading...' : 'Upgrade to Premium'}
            </button>
          </div>
        )}

        {/* Add Form Container */}
        {showAddForm && (
          <div className="w-full max-w-xl mt-8 p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-2xl relative shadow-2xl">
            <button
              onClick={() => { setShowAddForm(false); setEditingPartner(null); }}
              className="rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors"
            >
              Cancel
            </button>
            <p className="text-xs uppercase tracking-[0.25em] text-gold mt-2">Step 1 of 1</p>
            <h2 className="text-3xl font-display italic text-foreground mb-8 mt-1">{editingPartner ? 'Edit Partner ✨' : 'Add a Partner 💕'}</h2>
            {user && (
              <PartnerForm 
                userId={user.id} 
                partner={editingPartner || undefined}
                onSuccess={() => {
                  setShowAddForm(false);
                  setEditingPartner(null);
                  loadPartners();
                }} 
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
