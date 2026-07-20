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
import { PremiumLaunchModal } from '@/components/ui/PremiumLaunchModal';

export default function PartnersPage() {
  const { user, profile } = useUser();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const isPremium = !!profile?.is_premium;
  const canAddAnotherPartner = isPremium || partners.length === 0;

  const handleUpgrade = () => {
    setShowPremiumModal(true);
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
    <main className="min-h-dvh bg-transparent py-16 px-6 relative">
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
                className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-primary/20 active:bg-card/80 active:border-primary/30 transition-all duration-300 backdrop-blur-xl cursor-default shadow-sm hover:shadow-md active:shadow-md"
              >
                <span className="text-xl group-hover:scale-110 group-focus-within:scale-110 transition-transform">{partner.emoji || '💖'}</span>
                <span className="font-medium text-foreground text-lg tracking-wide">{partner.name}</span>
                
                {/* Edit & Delete buttons (show on hover) */}
                <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingPartner(partner); setShowAddForm(true); }}
                    className="glass-btn w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-100 touch-target"
                    title="Edit Partner"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(partner.id, e)}
                    className="bg-destructive/15 backdrop-blur-xl border border-destructive/25 text-destructive hover:bg-destructive/25 active:bg-destructive/35 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-100 touch-target"
                    title="Delete Partner"
                  >
                    <span className="text-lg font-bold">&times;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-8 text-muted-foreground italic font-display text-xl">
            Your partner list is currently empty.
          </div>
        )}

        {/* Add Partner Button */}
        {!showAddForm && canAddAnotherPartner && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full glass-btn hover:opacity-90 active:opacity-80 transition-all text-sm font-bold uppercase tracking-[0.2em] touch-target"
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
              className="rounded-full glass-btn-gold px-6 py-3 text-xs font-semibold touch-target"
            >
              Upgrade to Premium
            </button>
          </div>
        )}

        {/* Add Form Container */}
        {showAddForm && (
          <div className="w-full max-w-xl mt-8 p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-2xl relative shadow-2xl">
            <button
              onClick={() => { setShowAddForm(false); setEditingPartner(null); }}
              className="rounded-full glass-btn px-5 py-2.5 text-xs font-semibold touch-target"
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

      <PremiumLaunchModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        source="partners"
      />
    </main>
  );
}
