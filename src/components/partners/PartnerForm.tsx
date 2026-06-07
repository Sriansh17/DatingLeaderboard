'use client';

import { useState, useRef } from 'react';
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full overflow-hidden border border-border bg-background/50 dark:bg-black/40 backdrop-blur-xl flex items-center justify-center transition-all group-hover:border-primary/50 shadow-sm">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">{emoji}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-10 h-10 rounded-full border border-border bg-background/80 dark:bg-black/80 backdrop-blur-xl text-foreground flex items-center justify-center hover:border-primary/50 transition-colors shadow-xl"
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
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80">Partner's Name</label>
        <input
          id="partnerName"
          placeholder="e.g. Alex"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-2xl border border-border bg-background/50 dark:bg-black/40 backdrop-blur-xl px-6 py-4 text-lg font-display text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 shadow-sm"
        />
      </div>

      {/* Relationship Type */}
      <div className="space-y-3">
        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80">
          Relationship
        </label>
        <div className="flex flex-wrap gap-3">
          {RELATIONSHIPS.map((rel) => (
            <button
              key={rel.value}
              type="button"
              onClick={() => setRelationship(rel.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${
                relationship === rel.value
                  ? 'border-primary/30 bg-primary/10 text-primary shadow-[0_0_15px_rgba(232,69,107,0.1)]'
                  : 'border-border bg-background/50 dark:bg-black/40 backdrop-blur-xl text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {rel.label}
            </button>
          ))}
        </div>
      </div>

      {/* Emoji Selector */}
      <div className="space-y-3">
        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80">
          Signature Emoji
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`text-2xl h-12 w-12 rounded-full border flex items-center justify-center transition-all ${
                emoji === e
                  ? 'border-primary/30 bg-primary/10 scale-110 shadow-[0_0_15px_rgba(232,69,107,0.1)]'
                  : 'border-border bg-background/50 dark:bg-black/40 backdrop-blur-xl hover:border-primary/30'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-border mt-8">
        <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full flex items-center justify-center rounded-full bg-[#E92B54] py-4 font-bold text-white shadow-[0_0_20px_-5px_rgba(233,43,84,0.5)] transition-transform enabled:hover:scale-[1.02] disabled:opacity-40 uppercase tracking-[0.2em] text-[10px]"
      >
        Add Partner 💖
      </button>
      </div>
    </form>
  );
}
