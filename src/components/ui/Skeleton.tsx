'use client';

import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  variant?: 'card' | 'profile' | 'podium' | 'row' | 'avatar';
  count?: number;
  className?: string;
}

const shimmerBase =
  'relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm';

const shimmerOverlay =
  'absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer pointer-events-none';

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div className={cn(shimmerBase, className)}>
      <div className={shimmerOverlay} />
    </div>
  );
}

export function Skeleton({ variant = 'card', count = 1, className }: SkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={cn('space-y-6', className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-[2rem] border border-border bg-card/60 p-5 sm:p-8 backdrop-blur-sm min-h-[360px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer pointer-events-none" />
            {/* Header area: avatar circles + names */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative h-9 w-[48px] shrink-0">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-elevated/50" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-elevated/50 z-10" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded-full bg-elevated/50" />
                <div className="h-3 w-1/3 rounded-full bg-elevated/50" />
              </div>
              {/* Score ring placeholder */}
              <div className="h-20 w-20 rounded-full bg-elevated/50 shrink-0" />
            </div>
            {/* Body lines */}
            <div className="space-y-3 mb-8">
              <div className="h-6 w-full rounded-full bg-elevated/50" />
              <div className="h-6 w-4/5 rounded-full bg-elevated/50" />
              <div className="h-6 w-3/5 rounded-full bg-elevated/50" />
            </div>
            {/* AI verdict area */}
            <div className="space-y-2">
              <div className="h-3 w-16 rounded-full bg-elevated/50 mb-3" />
              <div className="h-4 w-full rounded-full bg-elevated/50" />
              <div className="h-4 w-2/3 rounded-full bg-elevated/50" />
            </div>
            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-border flex justify-between">
              <div className="flex gap-4">
                <div className="h-4 w-12 rounded-full bg-elevated/50" />
                <div className="h-4 w-12 rounded-full bg-elevated/50" />
              </div>
              <div className="h-4 w-16 rounded-full bg-elevated/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className={cn('space-y-6', className)}>
        {items.map((_, i) => (
          <div key={i} className="flex gap-6">
            {/* Avatar placeholder */}
            <div className="relative overflow-hidden rounded-full h-32 w-32 sm:h-44 sm:w-44 bg-elevated/50 shrink-0 border-4 border-elevated">
              <div className={shimmerOverlay} />
            </div>
            {/* Details */}
            <div className="flex-1 space-y-3 pt-4">
              <div className="h-6 w-1/3 rounded-full bg-elevated/50 relative overflow-hidden">
                <div className={shimmerOverlay} />
              </div>
              <div className="h-4 w-1/4 rounded-full bg-elevated/50 relative overflow-hidden">
                <div className={shimmerOverlay} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="h-16 rounded-2xl bg-elevated/50 relative overflow-hidden">
                    <div className={shimmerOverlay} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'podium') {
    const heights = ['h-28', 'h-36', 'h-28'];
    return (
      <div className={cn('flex items-end justify-center gap-4 px-4', className)}>
        {items.map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 w-28">
            {/* Avatar */}
            <div className="h-14 w-14 rounded-full bg-elevated/50 relative overflow-hidden">
              <div className={shimmerOverlay} />
            </div>
            {/* Name */}
            <div className="h-3 w-20 rounded-full bg-elevated/50 relative overflow-hidden">
              <div className={shimmerOverlay} />
            </div>
            {/* Podium block */}
            <div
              className={cn(
                'w-full rounded-t-2xl bg-elevated/30 relative overflow-hidden',
                i === 0 ? heights[1] : i === 1 ? heights[0] : heights[2]
              )}
            >
              <div className={shimmerOverlay} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className={cn('space-y-2', className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-sm relative overflow-hidden"
          >
            <div className={shimmerOverlay} />
            {/* Rank */}
            <div className="h-6 w-9 rounded bg-elevated/50" />
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-elevated/50 shrink-0" />
            {/* Name + details */}
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-1/4 rounded-full bg-elevated/50" />
              <div className="h-3 w-1/6 rounded-full bg-elevated/50" />
            </div>
            {/* Score */}
            <div className="h-6 w-12 rounded bg-elevated/50" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-full h-10 w-10 bg-elevated/50"
          >
            <div className={shimmerOverlay} />
          </div>
        ))}
      </div>
    );
  }

  // Default: card
  return <ShimmerBlock className={cn('h-48 w-full', className)} />;
}
