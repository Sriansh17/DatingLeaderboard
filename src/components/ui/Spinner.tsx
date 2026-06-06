import { Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'heart' | 'sparkle' | 'skeleton';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function Spinner({ size = 'md', className, variant = 'heart' }: SpinnerProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn("animate-pulse space-y-4", className)}>
        <div className="flex items-center gap-4">
          <div className={cn("rounded-full bg-elevated/50", sizeClasses[size])} />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-elevated/50 rounded w-1/3" />
            <div className="h-3 bg-elevated/50 rounded w-1/2" />
          </div>
        </div>
        <div className="h-24 bg-elevated/50 rounded-2xl w-full" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <div className="relative flex items-center justify-center">
        {variant === 'heart' ? (
          <>
            <Heart className={cn('text-blush animate-ping absolute opacity-20', sizeClasses[size])} />
            <Heart className={cn('text-blush animate-pulse-glow fill-blush/20 relative z-10', sizeClasses[size])} />
          </>
        ) : (
          <>
            <Sparkles className={cn('text-gold animate-spin-slow absolute opacity-30', sizeClasses[size])} />
            <Sparkles className={cn('text-gold animate-pulse relative z-10', sizeClasses[size])} />
          </>
        )}
      </div>
    </div>
  );
}
