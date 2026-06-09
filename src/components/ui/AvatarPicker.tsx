import { useState } from 'react';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

interface AvatarPickerProps {
  currentAvatar: string | null;
  onSelect: (url: string) => void;
  selectedGender?: string;
}

const AVATARS_3D = [
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Grinning%20Face%20with%20Big%20Eyes.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Sunglasses.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Cowboy%20Hat%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Dancing.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Dancing.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Alien%20Monster.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Robot.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Partying%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Horns.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Nerd%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Zany%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Face%20with%20Monocle.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Ghost.png"
];

const SEEDS = {
  // Swapped male and female seeds based on feedback!
  female: ["Mia", "Sophia", "Ava", "Avery", "Riley", "Isabella", "Emma", "Olivia", "Charlotte", "Amelia", "Harper", "Evelyn"],
  male: ["Felix", "Oliver", "Leo", "Jack", "Noah", "Liam", "Mason", "Ethan", "James", "William", "Lucas", "Henry"],
  other: ["Taylor", "Jordan", "Casey", "Riley", "Alex", "Morgan", "Avery", "Quinn", "Sam", "Jamie", "Drew", "Parker"]
};

export function AvatarPicker({ currentAvatar, onSelect, selectedGender }: AvatarPickerProps) {
  const renderGrid = (avatars: string[]) => (
    <div className="flex overflow-x-auto snap-x hide-scrollbar gap-3 pb-2">
      {avatars.map((url, idx) => {
        const isSelected = currentAvatar === url;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(url)}
            className={cn(
              "snap-start shrink-0 w-16 h-16 relative rounded-2xl overflow-hidden border-2 transition-all duration-300 group flex items-center justify-center p-2",
              isSelected 
                ? "border-primary bg-primary/10 shadow-[0_0_20px_-5px_rgba(233,43,84,0.5)] scale-105" 
                : "border-transparent bg-black/20 hover:bg-white/10 hover:border-white/20 opacity-80 hover:opacity-100"
            )}
          >
            <img 
              src={url} 
              alt="Avatar option" 
              className={cn(
                "w-full h-full object-contain transition-transform duration-500",
                isSelected ? "scale-110 drop-shadow-2xl" : "group-hover:scale-110"
              )}
            />
            {isSelected && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  const genderKey = (selectedGender === 'male' || selectedGender === 'female' || selectedGender === 'other') ? selectedGender : 'other';
  const current2DAvatars = SEEDS[genderKey].map(s => `https://api.dicebear.com/7.x/notionists/svg?seed=${s}&backgroundColor=transparent`);

  return (
    <div className="w-full flex flex-col gap-6 pt-2">
      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80 mb-3">
          2D Avatars
        </label>
        {renderGrid(current2DAvatars)}
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/80 mb-3">
          3D Avatars
        </label>
        {renderGrid(AVATARS_3D)}
      </div>
    </div>
  );
}
