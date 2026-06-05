'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { useCreatePost } from '@/lib/hooks/usePosts';
import type { Partner } from '@/types/database';
import type { AIScoreResult } from '@/types/api';
import { Sparkles, Heart, ShieldAlert } from 'lucide-react';

interface PostFormProps {
  partners: Partner[];
  userId: string;
}

export function PostForm({ partners, userId }: PostFormProps) {
  const [description, setDescription] = useState('');
  const [partnerId, setPartnerId] = useState(partners[0]?.id || '');
  const [isPublic, setIsPublic] = useState(true);
  const [aiResult, setAiResult] = useState<AIScoreResult | null>(null);
  const [showFlaggedModal, setShowFlaggedModal] = useState(false);
  const [flaggedReason, setFlaggedReason] = useState('');
  const router = useRouter();
  const { addToast } = useToast();
  const createPost = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      addToast('Please describe what your partner did!', 'warning');
      return;
    }

    if (!partnerId) {
      addToast('Please select your partner', 'warning');
      return;
    }

    try {
      const result = await createPost.mutateAsync({
        user_id: userId,
        partner_id: partnerId,
        description: description.trim(),
        is_public: isPublic,
      });

      setAiResult(result.aiResult);

      addToast(`Posted! Score: ${result.aiResult.score}/100 ❤️`, 'success');
      router.push('/dashboard');
    } catch (err: any) {
      if (err.flagged) {
        setFlaggedReason(err.message);
        setShowFlaggedModal(true);
      } else {
        addToast(err.message || 'Failed to post. Please try again.', 'error');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Partner Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Who are you appreciating?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {partners.map((partner) => (
            <button
              key={partner.id}
              type="button"
              onClick={() => setPartnerId(partner.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                partnerId === partner.id
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
              }`}
            >
              <span className="text-2xl">{partner.emoji}</span>
              <p className="text-sm font-medium mt-1">{partner.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <Textarea
        id="description"
        label="What did your partner do today?"
        placeholder="They made me breakfast in bed... They surprised me with tickets to my favorite band..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        required
      />

      {/* AI Score Preview */}
      {aiResult && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            <span className="font-semibold text-pink-600 dark:text-pink-400">LoveScore AI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-pink-500">{aiResult.score}/100</div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">{aiResult.feedback}</p>
            </div>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-600 dark:text-gray-400">
          Make this post public (visible on leaderboards)
        </label>
      </div>

      {/* Submit */}
      <Button type="submit" loading={createPost.isPending} className="w-full" size="lg">
        <Heart className="h-5 w-5" />
        Post & Get Scored
      </Button>

      {/* Sarcastic Flagged Entry Modal */}
      <Modal
        isOpen={showFlaggedModal}
        onClose={() => setShowFlaggedModal(false)}
        title="Love Referee: Red Card! 🟥"
        className="max-w-md"
      >
        <div className="text-center py-4 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 animate-bounce">
            <ShieldAlert className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Nice Try, Shakespeare! 🤨
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Our LoveScore AI guardrails caught some creative writing in your entry.
            </p>
          </div>

          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/10 dark:to-orange-900/10 border border-rose-100 dark:border-rose-900/30 text-left">
            <span className="absolute -top-3 left-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white rounded-full">
              Sarcasm Detector 🚨
            </span>
            <p className="text-gray-700 dark:text-gray-300 italic font-medium leading-relaxed">
              "{flaggedReason}"
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              type="button"
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => setShowFlaggedModal(false)}
            >
              My bad, let me tell the truth 😅
            </Button>
          </div>
        </div>
      </Modal>
    </form>
  );
}
