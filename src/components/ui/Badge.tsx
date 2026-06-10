import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger:  'bg-destructive/15 text-destructive',
  info:    'bg-primary/15 text-primary',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
