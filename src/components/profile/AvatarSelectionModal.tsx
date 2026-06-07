import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload } from 'lucide-react';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: any;
  onSuccess: () => void;
}

const AVATAR_OPTIONS = [
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Dog%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Unicorn.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Bear.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Rabbit%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Tiger%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Ninja.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Princess.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Vampire.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Grinning%20Face%20with%20Big%20Eyes.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Sunglasses.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Cowboy%20Hat%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Partying%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Horns.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Nerd%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Face%20with%20Monocle.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Alien%20Monster.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Robot.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Ghost.png"
];

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
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Avatar" className="max-w-2xl bg-[#0a0a0a] border-border/40 backdrop-blur-3xl shadow-2xl">
      <div className="py-6">
        <p className="text-sm text-muted-foreground/80 mb-6 text-center font-medium">
          Select a 3D avatar for your profile or upload your own.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
          {AVATAR_OPTIONS.map((url, i) => (
            <button
              key={i}
              disabled={loading}
              onClick={() => handleSelectAvatar(url)}
              className="relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#E92B54] transition-all group bg-white/5 flex items-center justify-center p-3"
            >
              <img src={url} alt={`Avatar option ${i + 1}`} className="w-[85%] h-[85%] object-contain group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-2xl" />
            </button>
          ))}
          
          <button
            disabled={loading}
            onClick={() => alert('Custom photo upload coming soon!')}
            className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-white/20 hover:border-[#E92B54] hover:bg-white/5 transition-all group flex flex-col items-center justify-center gap-2"
          >
            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-[#E92B54] transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">Upload</span>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#E92B54]" />
          </div>
        )}
      </div>
    </Modal>
  );
}
