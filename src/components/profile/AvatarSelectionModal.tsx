import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload } from 'lucide-react';
import { AvatarPicker } from '@/components/ui/AvatarPicker';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: any;
  onSuccess: () => void;
}

export function AvatarSelectionModal({ isOpen, onClose, currentProfile, onSuccess }: AvatarSelectionModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSelectAvatar = async (url: string) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', currentProfile.id);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Avatar" className="max-w-2xl bg-popover border-border/40 backdrop-blur-3xl shadow-2xl">
      <div className="py-6 space-y-6">
        <p className="text-sm text-muted-foreground/80 text-center font-medium">
          Select a 2D or 3D character for your profile.
        </p>

        <AvatarPicker 
          currentAvatar={currentProfile?.avatar_url}
          onSelect={handleSelectAvatar}
        />

        {/* Upload Button */}
        <div className="pt-4 border-t border-white/5">
          <button
            disabled={loading}
            onClick={() => alert('Custom photo upload coming soon!')}
            className="w-full p-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-primary hover:bg-white/5 active:border-primary/80 active:bg-white/10 transition-all group flex items-center justify-center gap-3"
          >
            <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary group-focus-within:text-primary transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-white group-focus-within:text-white transition-colors">Upload Custom Photo</span>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    </Modal>
  );
}
