'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import type { Toast, ToastVariant } from '@/types/ui';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastContextType {
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info', duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Centered alert box — shows one at a time */}
      <AnimatePresence>
        {toasts.length > 0 && (
          <motion.div
            key={toasts[0].id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => removeToast(toasts[0].id)}
            />
            <AlertBox toast={toasts[0]} onDismiss={() => removeToast(toasts[0].id)} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

const variantConfig: Record<ToastVariant, { border: string; bg: string; icon: React.ReactNode; label: string }> = {
  success: {
    border: 'border-success/40',
    bg: 'bg-success/10',
    icon: <CheckCircle2 className="h-6 w-6 text-success" />,
    label: 'Success',
  },
  error: {
    border: 'border-destructive/40',
    bg: 'bg-destructive/10',
    icon: <AlertCircle className="h-6 w-6 text-destructive" />,
    label: 'Error',
  },
  info: {
    border: 'border-primary/30',
    bg: 'bg-primary/10',
    icon: <Info className="h-6 w-6 text-primary" />,
    label: 'Info',
  },
  warning: {
    border: 'border-warning/40',
    bg: 'bg-warning/10',
    icon: <AlertTriangle className="h-6 w-6 text-warning" />,
    label: 'Warning',
  },
};

function AlertBox({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);
  const config = variantConfig[toast.variant];

  useEffect(() => {
    const start = Date.now();
    const duration = toast.duration ?? 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration, onDismiss]);

  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      exit={{ y: 20 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative w-full max-w-sm rounded-2xl border shadow-2xl backdrop-blur-xl overflow-hidden',
        config.border,
        config.bg
      )}
    >
      {/* Progress bar at top */}
      <div
        className="absolute top-0 left-0 h-1 bg-foreground/20 transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />

      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1">
              {config.label}
            </p>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="mt-4 w-full rounded-full bg-foreground/10 hover:bg-foreground/20 text-foreground text-sm font-semibold py-2.5 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}
