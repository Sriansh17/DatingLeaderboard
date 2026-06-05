import { cn } from '@/lib/utils/cn';
import { getRankEmoji } from '@/lib/utils/format';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'text-sm w-8 h-8',
  md: 'text-lg w-10 h-10',
  lg: 'text-2xl w-14 h-14',
};

export function RankBadge({ rank, size = 'md', className }: RankBadgeProps) {
  const emoji = getRankEmoji(rank);

  // For top 3, show the emoji; for others, show a styled number
  if (rank <= 3) {
    return (
      <span className={cn('flex items-center justify-center', className)}>
        {emoji}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold',
        sizeMap[size],
        className
      )}
    >
      <span className="text-xs">{emoji}</span>
    </div>
  );
}
