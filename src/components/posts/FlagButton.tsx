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
        className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
        title="Flag this post"
      >
        <Flag className="h-3 w-3" />
        {flagged ? 'Flagged' : 'Flag'}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Flag Post">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Why are you flagging this post?
          </p>
          {FLAG_REASONS.map((reason) => (
            <button
              key={reason.value}
              type="button"
              onClick={() => setSelectedReason(reason.value)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                selectedReason === reason.value
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300'
              }`}
            >
              {reason.label}
            </button>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              variant="danger"
              onClick={handleFlag}
              loading={submitting}
              disabled={!selectedReason}
            >
              Flag Post
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
