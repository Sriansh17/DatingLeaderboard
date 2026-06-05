'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Camera } from 'lucide-react';
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

const MAX_AVATAR_SIZE = 200;
const COMPRESSION_QUALITY = 0.7;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_AVATAR_SIZE) {
            height = Math.round((height / width) * MAX_AVATAR_SIZE);
            width = MAX_AVATAR_SIZE;
          }
        } else {
          if (height > MAX_AVATAR_SIZE) {
            width = Math.round((width / height) * MAX_AVATAR_SIZE);
            height = MAX_AVATAR_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Could not get canvas context')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

export function PartnerForm({ userId, onSuccess }: PartnerFormProps) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<string>('partner');
  const [emoji, setEmoji] = useState('💖');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image too large. Max 5MB', 'error');
      return;
    }
    try {
      const base64 = await resizeImage(file);
      setAvatarBase64(base64);
      setAvatarPreview(base64);
    } catch {
      addToast('Failed to process image', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const payload: Record<string, unknown> = {
      user_id: userId,
      name: name.trim(),
      relationship,
      emoji,
    };
    if (avatarBase64) {
      payload.avatar_url = avatarBase64;
    }

    const { data, error } = await supabase
      .from('partners')
      .insert(payload)
      .select()
      .single();

    if (error) {
      addToast(error.message, 'error');
      setLoading(false);
      return;
    }

    addToast(`Added ${name} to your partners! ❤️`, 'success');
    setName('');
    setAvatarBase64(null);
    setAvatarPreview(null);
    if (onSuccess) onSuccess(data);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar
            src={avatarPreview}
            alt={name || 'Partner'}
            size="lg"
            className="ring-2 ring-pink-200 dark:ring-pink-800"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors shadow-md"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-pink-500 hover:text-pink-600 font-medium"
        >
          Add Photo
        </button>
      </div>

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
