'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import type { Partner } from '@/types/database';
import { Plus, Edit3 } from 'lucide-react';
import { PartnerForm } from '@/components/partners/PartnerForm';

export default function PartnersPage() {
  const { user } = useUser();
  const { addToast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

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
    if (!confirm('Remove this partner?')) return;
    const supabase = createClient();
    await supabase.from('partners').delete().eq('id', id);
    addToast('Partner removed', 'info');
    loadPartners();
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-transparent">
      <Spinner size="lg" className="text-primary" />
    </div>
  );

  return (
    <main className="min-h-screen bg-transparent py-16 px-6 relative">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Header Section */}
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-4">
          My Circle
        </p>
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
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-primary font-medium tracking-wide shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Partner
          </button>
        )}

        {/* Add Form Container */}
        {showAddForm && (
          <div className="w-full max-w-xl mt-8 p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-2xl relative shadow-2xl">
            <button 
              onClick={() => { setShowAddForm(false); setEditingPartner(null); }}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
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
