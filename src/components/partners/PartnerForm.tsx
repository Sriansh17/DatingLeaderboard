'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import type { Partner } from '@/types/database';

const EMOJI_OPTIONS = ['💖', '❤️', '💕', '💗', '💓', '🩷', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎'];

const RELATIONSHIPS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'partner', label: 'Partner' },
  { value: 'boyfriend', label: 'Boyfriend' },
  { value: 'girlfriend', label: 'Girlfriend' },
  { value: 'other', label: 'Other' },
] as const;

interface PartnerFormProps {
  userId: string;
  onSuccess?: (partner: Partner) => void;
}

export function PartnerForm({ userId, onSuccess }: PartnerFormProps) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<string>('partner');
  const [emoji, setEmoji] = useState('💖');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('partners')
      .insert({
        user_id: userId,
        name: name.trim(),
        relationship,
        emoji,
      })
      .select()
      .single();

    if (error) {
      addToast(error.message, 'error');
      setLoading(false);
      return;
    }

    addToast(`Added ${name} to your partners! ❤️`, 'success');
    setName('');
    if (onSuccess) onSuccess(data);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="partnerName"
        label="Partner's Name"
        placeholder="Alex"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* Relationship Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Relationship
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {RELATIONSHIPS.map((rel) => (
            <button
              key={rel.value}
              type="button"
              onClick={() => setRelationship(rel.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                relationship === rel.value
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-pink-300'
              }`}
            >
              {rel.label}
            </button>
          ))}
        </div>
      </div>

      {/* Emoji Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Choose an Emoji
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`text-2xl p-2 rounded-lg border transition-all ${
                emoji === e
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10 scale-110'
                  : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Add Partner 💕
      </Button>
    </form>
  );
}
