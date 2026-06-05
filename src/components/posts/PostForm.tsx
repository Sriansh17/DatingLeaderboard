'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { useCreatePost } from '@/lib/hooks/usePosts';
import type { Partner } from '@/types/database';
import type { AIScoreResult } from '@/types/api';
import { Sparkles, Heart } from 'lucide-react';

interface PostFormProps {
  partners: Partner[];
  userId: string;
}

export function PostForm({ partners, userId }: PostFormProps) {
  const [description, setDescription] = useState('');
  const [partnerId, setPartnerId] = useState(partners[0]?.id || '');
  const [isPublic, setIsPublic] = useState(true);
  const [aiResult, setAiResult] = useState<AIScoreResult | null>(null);
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

    const result = await createPost.mutateAsync({
      user_id: userId,
      partner_id: partnerId,
      description: description.trim(),
      is_public: isPublic,
    });

    setAiResult(result.aiResult);

    addToast(`Posted! Score: ${result.aiResult.score}/100 ❤️`, 'success');
    router.push('/dashboard');
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
    </form>
  );
}
