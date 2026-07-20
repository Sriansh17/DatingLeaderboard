'use client';

import { cn } from '@/lib/utils/cn';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom';
  className?: string;
}

export function Tooltip({ children, content, side = 'top', className }: TooltipProps) {
  return (
    <div className={cn('group relative inline-flex', className)}>
      {children}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 z-50',
          'pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          'whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-medium',
          'bg-popover border border-border text-muted-foreground shadow-sm',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        )}
      >
        {content}
      </div>
    </div>
  );
}
