import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
};

const DEFAULT_3D_AVATARS = [
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Grinning%20Face%20with%20Big%20Eyes.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Sunglasses.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Cowboy%20Hat%20Face.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Partying%20Face.png"
];

export function Avatar({ src, alt = '', size = 'md', className }: AvatarProps) {
  // Deterministic fallback based on name length so it stays consistent
  const fallbackSrc = DEFAULT_3D_AVATARS[alt.length % DEFAULT_3D_AVATARS.length];
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('rounded-full object-cover', sizeMap[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-secondary/50 dark:bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden',
        sizeMap[size],
        className
      )}
    >
      <img
        src={fallbackSrc}
        alt={alt}
        className="w-[80%] h-[80%] object-contain drop-shadow-lg"
      />
    </div>
  );
}
