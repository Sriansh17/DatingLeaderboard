'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import type { ButtonVariant, ButtonSize } from '@/types/ui';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary/15 backdrop-blur-xl border border-primary/25 text-primary hover:bg-primary/25 active:bg-primary/35 shadow-[var(--shadow-glow)]',
  secondary:
    'bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-border/60 text-foreground hover:bg-white/20 dark:hover:bg-white/10 active:bg-white/30 dark:active:bg-white/20',
  outline:
    'bg-transparent backdrop-blur-xl border border-border text-foreground hover:bg-white/10 dark:hover:bg-white/5 active:bg-white/20 dark:active:bg-white/10',
  ghost:
    'bg-transparent text-muted-foreground hover:bg-white/10 dark:hover:bg-white/5 active:bg-white/20 dark:active:bg-white/10',
  danger:
    'bg-destructive/15 backdrop-blur-xl border border-destructive/25 text-destructive hover:bg-destructive/25 active:bg-destructive/35',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
