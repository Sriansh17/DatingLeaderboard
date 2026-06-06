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

export function Avatar({ src, alt = '', size = 'md', className }: AvatarProps) {
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
        'rounded-full bg-gradient-to-br from-pink-400 to-accent flex items-center justify-center text-white font-semibold',
        sizeMap[size],
        className
      )}
    >
      {alt.charAt(0).toUpperCase() || '?'}
    </div>
  );
}
