'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useUser } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Flag } from 'lucide-react';

const FLAG_REASONS = [
  { value: 'no_description', label: "Doesn't describe what partner did" },
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'offensive', label: 'Offensive' },
  { value: 'other', label: 'Other' },
];

interface FlagButtonProps {
  postId: string;
  postUserId: string;
}

export function FlagButton({ postId, postUserId }: FlagButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const { addToast } = useToast();
  const { user } = useUser();

  const handleFlag = async () => {
    if (!user) {
      addToast('Please sign in to flag posts', 'warning');
      return;
    }
    if (!selectedReason) {
      addToast('Please select a reason', 'warning');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('flags').insert({
      post_id: postId,
      user_id: user.id,
      reason: selectedReason,
    });

    if (error) {
      if (error.code === '23505') {
        addToast('You already flagged this post', 'info');
      } else {
        addToast('Failed to flag post', 'error');
      }
    } else {
      setFlagged(true);
      addToast('Post flagged for review. Thanks! 🙏', 'success');
      setOpen(false);
    }
    setSubmitting(false);
  };

  // Don't show flag button for own posts
  if (user && user.id === postUserId) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
        title="Flag this post"
      >
        <Flag className="h-3 w-3" />
        {flagged ? 'Flagged' : 'Flag'}
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Flag Post">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Why are you flagging this post?
          </p>
          {FLAG_REASONS.map((reason) => (
            <button
              key={reason.value}
              type="button"
              onClick={() => setSelectedReason(reason.value)}
              className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-medium border transition-all ${
                selectedReason === reason.value
                  ? 'border-destructive bg-destructive/10 text-destructive shadow-[0_0_15px_rgba(var(--destructive-rgb),0.2)]'
                  : 'border-white/10 bg-white/5 text-foreground hover:border-white/20 hover:bg-white/10'
              }`}
            >
              {reason.label}
            </button>
          ))}
          <div className="flex gap-3 pt-4">
            <button 
              className="flex-1 py-3 rounded-xl border border-white/10 bg-transparent text-foreground hover:bg-white/5 transition-colors font-medium text-sm" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50 transition-opacity font-medium text-sm shadow-[0_0_30px_-5px_var(--destructive)]"
              onClick={handleFlag}
              disabled={!selectedReason || submitting}
            >
              {submitting ? 'Flagging...' : 'Flag Post'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
