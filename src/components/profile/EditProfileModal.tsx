import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Camera, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AvatarSelectionModal } from './AvatarSelectionModal';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: any;
  currentUser?: any;
  onSuccess: () => void;
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
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const supabase = createClient();
      
      // Update all fields in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username, full_name: fullName, bio, age, gender, city, occupation, country })
        .eq('id', currentProfile.id);

      // Update user metadata (age, gender, occupation live here)
      const { error: metaError } = await supabase.auth.updateUser({
        data: { age, gender, city, occupation, country }
      });

      if (!profileError && !metaError) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" className="max-w-2xl bg-popover border-border/40 backdrop-blur-3xl shadow-2xl">
      <form onSubmit={handleSubmit} className="mt-4">
        {/* Scrollable fields area */}
        <div className="space-y-6 overflow-y-auto pr-3" style={{maxHeight:'calc(80vh - 160px)'}}>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
              <div className="w-20 h-20 rounded-full overflow-hidden border border-border flex items-center justify-center transition-all bg-background font-display text-3xl text-muted-foreground shadow-lg group-hover:border-blush/50">
                {currentProfile?.avatar_url ? (
                  currentProfile.avatar_url.startsWith('http') ? (
                    <img src={currentProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{currentProfile.avatar_url}</span>
                  )
                ) : (
                  username[1]?.toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute inset-0 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/60 -mt-1">Tap to change</p>
          </div>
          <AvatarSelectionModal
            isOpen={avatarModalOpen}
            onClose={() => setAvatarModalOpen(false)}
            currentProfile={currentProfile}
            onSuccess={() => { setAvatarModalOpen(false); onSuccess(); }}
          />

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

        {/* Sticky save button — always visible */}
        <div className="sticky bottom-0 pt-4 mt-2 bg-popover">
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full flex items-center justify-center rounded-full bg-primary py-3.5 font-bold text-primary-foreground shadow-glow transition-transform enabled:hover:scale-[1.02] disabled:opacity-40 uppercase tracking-[0.2em] text-[10px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
