'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/providers/AuthProvider';
import { Camera } from 'lucide-react';
import type { Partner } from '@/types/database';
import { AvatarPicker, type Gender } from '@/components/ui/AvatarPicker';

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
  partner?: Partner;
  onSuccess?: (partner: Partner) => void;
  compact?: boolean;
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

export function PartnerForm({ userId, partner, onSuccess, compact = false }: PartnerFormProps) {
  const { refreshProfile } = useUser();
  const [name, setName] = useState(partner?.name || '');
  const [relationship, setRelationship] = useState<string>(partner?.relationship || 'partner');
  const [gender, setGender] = useState<Gender>('');
  const [emoji, setEmoji] = useState(partner?.emoji || '💖');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(partner?.avatar_url || null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(partner?.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_premium: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upgrade to premium');
      }
      await refreshProfile();
      setShowPremiumPrompt(false);
      addToast('Premium activated. You can now add multiple partners.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Upgrade failed. Please try again.', 'error');
    } finally {
      setUpgrading(false);
    }
  };

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
    setShowPremiumPrompt(false);

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

    let data: Partner | null = null;
    let errorMessage: string | null = null;

    if (partner) {
      const result = await supabase
        .from('partners')
        .update(payload)
        .eq('id', partner.id)
        .select()
        .single();
      data = result.data;
      errorMessage = result.error?.message || null;
    } else {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          relationship,
          emoji,
          avatar_url: avatarBase64 || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        if (json.code === 'PREMIUM_REQUIRED') {
          setShowPremiumPrompt(true);
        }
        errorMessage = json.error || 'Failed to create partner';
      } else {
        data = json.data;
      }
    }

    if (errorMessage || !data) {
      addToast(errorMessage || 'Failed to save partner', 'error');
      setLoading(false);
      return;
    }

    addToast(partner ? `Updated ${name}'s profile!` : `Added ${name} to your partners! ❤️`, 'success');
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
          <div className="w-28 h-28 rounded-full overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center transition-all group-hover:border-blush/50">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">{emoji}</span>
            )}
            {/* Camera overlay on hover */}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-elevated/90 backdrop-blur border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors shadow-sm"
            title="Upload custom photo"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      {!compact && (
        <>
          {/* Gender Selection */}
          <div className="space-y-3">
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80">
              Partner's Gender (To suggest characters)
            </label>
            <div className="flex flex-wrap gap-3">
              {(['male', 'female', 'other'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all capitalize ${
                    gender === g
                      ? 'border-primary/50 bg-primary/10 text-primary shadow-glow'
                      : 'border-border bg-elevated/40 text-muted-foreground hover:bg-elevated hover:text-foreground active:bg-elevated/80 active:text-foreground'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Selection Grid */}
          <AvatarPicker
            selectedGender={gender}
            currentAvatar={avatarPreview}
            onSelect={(url) => { setAvatarBase64(url); setAvatarPreview(url); }}
          />
        </>
      )}

      {/* Name */}
      <div className="space-y-3">
        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80">Partner's Name</label>
        <input
          id="partnerName"
          placeholder="e.g. Alex"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-2xl border border-border bg-elevated/40 px-6 py-4 text-lg font-display text-foreground outline-none focus:bg-card focus:border-blush/50 transition-colors placeholder:text-muted-foreground/50 shadow-sm"
        />
      </div>

      {/* Relationship Type — hidden in compact */}
      {!compact && (
        <div className="space-y-3">
          <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80">Relationship</label>
          <div className="flex flex-wrap gap-3">
            {RELATIONSHIPS.map((rel) => (
              <button
                key={rel.value}
                type="button"
                onClick={() => setRelationship(rel.value)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${
                  relationship === rel.value
                    ? 'border-blush/30 bg-blush/10 text-blush shadow-glow'
                    : 'border-border bg-elevated/40 text-muted-foreground hover:bg-elevated hover:text-foreground active:bg-elevated/80 active:text-foreground'
                }`}
              >
                {rel.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
              className={`text-2xl h-10 w-10 rounded-full border flex items-center justify-center transition-all ${
                emoji === e
                  ? 'border-blush/30 bg-blush/10 scale-110 shadow-glow'
                  : 'border-border bg-elevated/40 hover:bg-elevated active:bg-elevated/80'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {showPremiumPrompt && !partner && (
        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gold">Premium required</p>
          <p className="text-sm text-foreground/90">
            Free plan supports one partner. Upgrade to premium to add multiple partners.
          </p>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={upgrading}
            className="rounded-full bg-gold/90 hover:bg-gold active:bg-gold/80 px-5 py-2 text-xs font-semibold text-black transition-colors"
          >
            {upgrading ? 'Upgrading...' : 'Upgrade to Premium'}
          </button>
        </div>
      )}

      <div className={`${compact ? 'pt-2' : 'pt-6 border-t border-white/5 mt-8'}`}>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full flex items-center justify-center rounded-full glass-btn py-3.5 font-bold transition-transform enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:opacity-40 uppercase tracking-[0.2em] text-[10px]"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="rounded-full glass-btn px-4 py-2" />
              {partner ? 'Saving...' : 'Adding...'}
            </span>
          ) : (partner ? 'Save Changes' : 'Add Partner 💖')}
        </button>
      </div>
    </form>
  );
}
