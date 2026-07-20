import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ icon = '💫', title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 sm:py-24 px-6',
        'rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm',
        className
      )}
    >
      {icon && (
        <span className="text-5xl sm:text-6xl mb-6 block select-none" role="img" aria-hidden="true">
          {icon}
        </span>
      )}
      <h3 className="font-display text-2xl sm:text-3xl italic text-foreground mb-3">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed mb-8">
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 rounded-full glass-btn px-6 py-3 text-sm font-semibold touch-target"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 rounded-full glass-btn px-6 py-3 text-sm font-semibold touch-target"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
