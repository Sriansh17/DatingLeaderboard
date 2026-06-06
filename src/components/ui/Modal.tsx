'use client';

import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-300',
          'rounded-3xl border border-border bg-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl',
          className
        )}
        style={{
          background: "linear-gradient(160deg, color-mix(in oklab, var(--surface) 92%, var(--primary) 8%), var(--surface))",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)"
        }}
      >
        <div className="flex items-center justify-between mb-6">
          {title && <h2 className="text-2xl font-display italic font-bold text-foreground">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors bg-white/5 border border-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
