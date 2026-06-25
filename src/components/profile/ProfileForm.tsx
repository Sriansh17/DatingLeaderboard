'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Camera } from 'lucide-react';
import type { Profile } from '@/types/database';

interface ProfileFormProps {
  profile: Profile;
  onSuccess?: () => void;
}

const MAX_AVATAR_SIZE = 200; // px
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

export function ProfileForm({ profile, onSuccess }: ProfileFormProps) {
  const [username, setUsername] = useState(profile.username || '');
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [city, setCity] = useState(profile.city || '');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
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
    const updates: Record<string, unknown> = {
      username: username.trim(),
      full_name: fullName.trim() || null,
      bio: bio.trim() || null,
      city: city.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (avatarBase64) {
      updates.avatar_url = avatarBase64;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (error) {
      addToast(error.message, 'error');
      setLoading(false);
      return;
    }

    addToast('Profile updated! ✨', 'success');
    setAvatarBase64(null);
    setLoading(false);
    if (onSuccess) onSuccess();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar
            src={avatarPreview || profile.avatar_url}
            alt={profile.username}
            size="lg"
            className="ring-2 ring-blush/40"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
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
          className="text-xs text-primary hover:text-primary font-medium"
        >
          Change Photo
        </button>
      </div>

      <Input
        id="username"
        label="Username"
        placeholder="lovestruck42"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <Input
        id="fullName"
        label="Full Name"
        placeholder="Alex Johnson"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <Textarea
        id="bio"
        label="Bio"
        placeholder="Tell the world about your relationship..."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={3}
      />

      <Input
        id="city"
        label="City"
        placeholder="New York, NY"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <Button type="submit" loading={loading} className="w-full">
        Save Changes ✨
      </Button>
    </form>
  );
}
