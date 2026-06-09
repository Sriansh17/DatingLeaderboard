'use client';

import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div
            initial={{ opacity: 0, filter: "blur(20px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)", scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6',
              'rounded-3xl border border-border bg-card shadow-2xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl',
              className
            )}
          >
            <div className="flex items-center justify-between mb-6">
              {title && <h2 className="text-2xl font-display italic font-bold text-foreground">{title}</h2>}
              <button
                onClick={onClose}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-foreground">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
