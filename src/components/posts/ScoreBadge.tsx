import { cn } from '@/lib/utils/cn';
import { getScoreColor, getScoreBgColor } from '@/lib/utils/format';

interface ScoreBadgeProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-10 h-10 text-sm rounded-xl',
  md: 'w-14 h-14 text-lg rounded-2xl',
  lg: 'w-20 h-20 text-2xl rounded-3xl',
};

export function ScoreBadge({ score, size = 'md', showLabel = false, className }: ScoreBadgeProps) {
  if (score === null) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className={cn('flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 font-bold', sizeMap[size], className)}>
          ?
        </div>
        {showLabel && <span className="text-xs text-gray-400">Pending</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'flex items-center justify-center text-white font-bold shadow-sm',
          sizeMap[size],
          getScoreBgColor(score).replace('text-', 'bg-'),
          className
        )}
      >
        {score}
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', getScoreColor(score))}>
          {score >= 80 ? 'Amazing!' : score >= 60 ? 'Great!' : score >= 40 ? 'Nice!' : 'Sweet!'}
        </span>
      )}
    </div>
  );
}
