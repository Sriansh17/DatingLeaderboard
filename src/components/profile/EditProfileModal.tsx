import { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: Profile;
  currentUser?: any;
  onSuccess: () => void;
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

export function EditProfileModal({ isOpen, onClose, currentProfile, currentUser, onSuccess }: EditProfileModalProps) {
  const [username, setUsername] = useState(currentProfile?.username || '');
  const [fullName, setFullName] = useState(currentProfile?.full_name || '');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [age, setAge] = useState(currentProfile?.age || '');
  const [gender, setGender] = useState(currentProfile?.gender || '');
  const [city, setCity] = useState(currentProfile?.city || '');
  const [occupation, setOccupation] = useState(currentProfile?.occupation || '');
  const [country, setCountry] = useState(currentProfile?.country || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Max 5MB');
      return;
    }

    try {
      const base64 = await resizeImage(file);
      setAvatarBase64(base64);
      setError(null);
    } catch {
      setError('Failed to process image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setError(null);
      const supabase = createClient();

      const updates: Record<string, unknown> = {
        username,
        full_name: fullName,
        bio,
        age,
        gender,
        city,
        occupation,
        country,
        updated_at: new Date().toISOString(),
      };

      if (avatarBase64) {
        updates.avatar_url = avatarBase64;
      }

      // Update all fields in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentProfile.id);

      // Update user metadata (age, gender, occupation live here)
      const { error: metaError } = await supabase.auth.updateUser({
        data: { age, gender, city, occupation, country }
      });

      if (!profileError && !metaError) {
        onSuccess();
        onClose();
      } else {
        setError(profileError?.message || metaError?.message || 'Failed to save changes');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" className="max-w-2xl bg-popover border-border/40 backdrop-blur-3xl shadow-2xl">
      <form onSubmit={handleSubmit} className="mt-4">
        {/* Scrollable fields area */}
        <div className="space-y-6 overflow-y-auto pr-3" style={{maxHeight:'calc(80vh - 160px)'}}>
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative">
              <Avatar
                src={avatarBase64 || currentProfile?.avatar_url}
                alt={currentProfile?.username}
                size="lg"
                className="ring-2 ring-blush/40"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full glass-btn flex items-center justify-center shadow-md"
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
              className="text-xs text-primary hover:text-primary active:text-primary/80 font-medium"
            >
              Change Photo
            </button>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1 group">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 px-0 text-xl font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
            />
          </div>
          <div className="space-y-1 group">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Username</label>
            <div className="flex items-center border-b border-border focus-within:border-primary transition-colors">
              <span className="text-xl font-display text-muted-foreground/50 pb-0.5">@</span>
              <input
                type="text"
                value={username.replace('@', '')}
                onChange={(e) => setUsername(e.target.value.replace(/[@\s]/g, ''))}
                className="flex-1 border-0 bg-transparent py-2 px-1 text-xl font-display text-foreground outline-none placeholder:text-muted-foreground/30"
                required
              />
            </div>
          </div>

          <div className="space-y-1 group">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Age</label>
            <input
              type="text"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 px-0 text-xl font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="space-y-1 group">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Gender</label>
            <input
              type="text"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 px-0 text-xl font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="space-y-1 group">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 px-0 text-xl font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="space-y-1 group">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Occupation</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 px-0 text-xl font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="space-y-1 group">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. India"
              className="w-full border-b border-border bg-transparent py-2 px-0 text-xl font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
            />
          </div>
        </div>

        {/* Dating Philosophy */}
        <div className="space-y-1 group">
          <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Dating Philosophy</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            placeholder="What's your approach to love?"
            className="w-full resize-none border-b border-border bg-transparent py-2 px-0 text-xl font-display italic text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30"
          />
        </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 mt-4">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-xs font-medium text-destructive">{error}</p>
          </div>
        )}

        {/* Sticky save button — always visible */}
        <div className="sticky bottom-0 pt-4 mt-2 bg-popover">
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full flex items-center justify-center rounded-full bg-primary py-3.5 font-bold text-primary-foreground shadow-glow transition-transform enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:opacity-40 uppercase tracking-[0.2em] text-[10px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
