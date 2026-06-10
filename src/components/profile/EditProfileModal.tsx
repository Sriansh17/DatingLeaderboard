import { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Camera, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: any;
  onSuccess: () => void;
}

export function EditProfileModal({ isOpen, onClose, currentProfile, onSuccess }: EditProfileModalProps) {
  const p = currentProfile || {};
  const [username, setUsername] = useState(p.username || '');
  const [bio, setBio] = useState(p.bio || "Reviewing dates, analyzing romance, and sharing stories. Welcome to my archive of romantic adventures.");
  const [age, setAge] = useState(p.age || '');
  const [gender, setGender] = useState(p.gender || '');
  const [city, setCity] = useState(p.city || '');
  const [occupation, setOccupation] = useState(p.occupation || '');
  const [country, setCountry] = useState(p.country || '');
  
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const supabase = createClient();
      
      // Update all fields in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ username, bio, age, gender, city, occupation, country })
        .eq('id', currentProfile.id);

      if (!error) {
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
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-full overflow-hidden border border-border flex items-center justify-center transition-all bg-background font-display text-3xl text-muted-foreground shadow-lg group-hover:border-blush/50">
                {username[1]?.toUpperCase() || 'U'}
              </div>
              <div className="absolute inset-0 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={() => alert("Photo upload coming soon!")} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border-b border-border bg-transparent py-1.5 px-0 text-lg font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Age</label>
              <input type="text" value={age} onChange={(e) => setAge(e.target.value)} className="w-full border-b border-border bg-transparent py-1.5 px-0 text-lg font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Gender</label>
              <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border-b border-border bg-transparent py-1.5 px-0 text-lg font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border-b border-border bg-transparent py-1.5 px-0 text-lg font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Occupation</label>
              <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full border-b border-border bg-transparent py-1.5 px-0 text-lg font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. India" className="w-full border-b border-border bg-transparent py-1.5 px-0 text-lg font-display text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-gold">Dating Philosophy (Bio)</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="w-full resize-none border-b border-border bg-transparent py-1.5 px-0 text-lg font-display italic text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30" />
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
