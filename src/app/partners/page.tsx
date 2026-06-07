'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { PartnerForm } from '@/components/partners/PartnerForm';
import { Spinner } from '@/components/ui/Spinner';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import type { Partner } from '@/types/database';
import { Plus } from 'lucide-react';

export default function PartnersPage() {
  const { user } = useUser();
  const { addToast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from your partners?`)) return;
    const supabase = createClient();
    await supabase.from('partners').delete().eq('id', id);
    addToast(`${name} removed`, 'info');
    loadPartners();
  };

  if (loading) return <Spinner size="lg" className="mx-auto mt-20" />;

  return (
    <div className="max-w-xl mx-auto px-6 py-12 space-y-8 min-h-[60vh] flex flex-col">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gold mb-2">My Circle</p>
        <h1 className="font-display text-4xl italic text-foreground">Partners</h1>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {partners.map((partner) => (
          <div key={partner.id} className="relative group">
            <div className="px-5 py-2.5 rounded-full border border-border bg-elevated/40 backdrop-blur-sm flex items-center gap-2 transition-transform hover:scale-105 cursor-default">
              <span className="text-xl">{partner.emoji}</span>
              <span className="font-medium text-foreground">{partner.name}</span>
            </div>
            {/* Delete button appears on hover */}
            <button 
              onClick={() => handleDelete(partner.id, partner.name)}
              className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-md flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
        
        {!showAdd && (
          <button 
            onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 rounded-full border border-primary/30 bg-primary/10 text-primary dark:text-blush font-medium flex items-center gap-2 hover:bg-primary/20 transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" /> Add Partner
          </button>
        )}
      </div>

      {showAdd && user && (
        <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 relative">
          <button 
            onClick={() => setShowAdd(false)}
            className="absolute top-8 right-0 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Step 1 of 1</p>
          <h1 className="mt-1 font-display text-3xl italic leading-tight text-foreground">Add a Partner 💕</h1>
          <p className="mt-2 text-sm text-muted-foreground mb-8">Tell us about your special someone before you submit a verdict.</p>
          
          <PartnerForm 
            userId={user.id} 
            onSuccess={() => {
              setShowAdd(false);
              loadPartners();
            }} 
          />
        </div>
      )}

      {partners.length === 0 && !showAdd && (
        <div className="text-center py-12 text-muted-foreground">
          <p>You haven't added any partners yet.</p>
          <p className="text-sm mt-2 opacity-70">Add someone to start scoring your dates!</p>
        </div>
      )}
    </div>
  );
}
