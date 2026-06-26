'use client';

import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
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
      {/* Non-blocking toast stack — centered at top, no backdrop */}
      <div
        className="fixed inset-x-0 top-4 z-[200] flex flex-col items-center pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        <div className="flex flex-col gap-3 max-w-sm w-full mx-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
      </div>
    </ToastContext.Provider>
  );
}

const variantConfig: Record<ToastVariant, { border: string; bg: string; icon: React.ReactNode; label: string }> = {
  success: {
    border: 'border-success/40',
    bg: 'bg-success/10',
    icon: <CheckCircle2 className="h-5 w-5 text-success" />,
    label: 'Success',
  },
  error: {
    border: 'border-destructive/40',
    bg: 'bg-destructive/10',
    icon: <AlertCircle className="h-5 w-5 text-destructive" />,
    label: 'Error',
  },
  info: {
    border: 'border-primary/30',
    bg: 'bg-primary/10',
    icon: <Info className="h-5 w-5 text-primary" />,
    label: 'Info',
  },
  warning: {
    border: 'border-warning/40',
    bg: 'bg-warning/10',
    icon: <AlertTriangle className="h-5 w-5 text-warning" />,
    label: 'Warning',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
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
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative w-full rounded-2xl border shadow-lg backdrop-blur-xl overflow-hidden pointer-events-auto',
        config.border,
        config.bg
      )}
    >
      {/* Progress bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 bg-foreground/20"
        style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
      />

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-0.5">
              {config.label}
            </p>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors -mr-1 -mt-1"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
