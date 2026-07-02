'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumLaunchModal } from '@/components/ui/PremiumLaunchModal';
import type { Post } from '@/types/database';

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
}

export function EditPostModal({ post, isOpen, onClose, isPremium }: EditPostModalProps) {
  const [description, setDescription] = useState(post.description);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phase, setPhase] = useState<'edit' | 'scoring'>('edit');
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleUpgrade = () => {
    setShowPremiumModal(true);
  };

  const handleSubmit = async () => {
    if (!description.trim() || description.trim() === post.description) return;
    if (description.trim().length < 30) {
      addToast('Description must be at least 30 characters.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setPhase('scoring');

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        if (json.code === 'PREMIUM_REQUIRED') {
          addToast('Editing posts requires premium.', 'warning');
        } else if (json.flagged) {
          addToast(json.error || 'Post was flagged as invalid.', 'error');
        } else {
          throw new Error(json.error || 'Failed to update post');
        }
        return;
      }

      // Invalidate cached post so detail page reloads with new score
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['explore-posts'] });

      addToast('Post updated and re-scored!', 'success');
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to update post. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
      setPhase('edit');
    }
  };

  // Premium upsell view
  if (!isPremium) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Premium Feature">
        <div className="space-y-6 text-center py-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Crown className="h-8 w-8 text-gold" />
          </div>
          <div>
            <h3 className="font-display text-xl italic text-foreground mb-2">Edit Posts</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Editing previous posts is a premium feature. Upgrade to premium to rewrite your story and get a fresh AI verdict.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-left space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Premium includes</p>
            {['Edit any previous post', 'Unlimited posts per day', 'Streak restoration'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                <span className="text-gold">✓</span> {f}
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary active:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpgrade}
              className="rounded-full bg-gold/90 hover:bg-gold active:bg-gold/80 px-5 py-2 text-xs font-semibold text-black transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <PremiumLaunchModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        source="edit-post"
      />
    <Modal isOpen={isOpen} onClose={isSubmitting ? () => {} : onClose} title="Edit Post">
      <AnimatePresence mode="wait">
        {phase === 'scoring' ? (
          <motion.div
            key="scoring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 gap-4"
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
              <div className="absolute inset-0 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '2s' }} />
              <Sparkles className="h-7 w-7 text-gold animate-pulse" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Re-scoring your post…</p>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <p className="text-xs text-muted-foreground leading-relaxed">
              Editing will re-run AI scoring on your updated description. The score and verdict will be replaced.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={7}
              className="w-full resize-none rounded-2xl border border-border bg-card/80 p-5 font-display text-lg italic leading-relaxed text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/30"
              placeholder="Rewrite your story…"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{description.length} chars</span>
              {description.length < 30 && <span className="text-amber-500">Need at least 30 characters</span>}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary active:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  description.trim().length < 30 ||
                  description.trim() === post.description
                }
                className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving…' : 'Save & Re-score'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
    </>
  );
}
