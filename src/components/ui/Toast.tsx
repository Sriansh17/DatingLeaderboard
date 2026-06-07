'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
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
      <div className="fixed top-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const variantStyles: Record<ToastVariant, { border: string; icon: React.ReactNode }> = {
  success: { border: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200', icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" /> },
  error: { border: 'border-rose-500/50 bg-rose-500/10 text-rose-800 dark:text-rose-200', icon: <AlertCircle className="h-5 w-5 text-rose-400" /> },
  info: { border: 'border-blue-500/50 bg-blue-500/10 text-blue-800 dark:text-blue-200', icon: <Info className="h-5 w-5 text-blue-400" /> },
  warning: { border: 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-200', icon: <AlertTriangle className="h-5 w-5 text-amber-400" /> },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(toast.id), 300); // wait for animation
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const style = variantStyles[toast.variant];

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300',
        style.border,
        isLeaving ? 'animate-out fade-out slide-out-to-top-4' : 'animate-in fade-in slide-in-from-top-4'
      )}
    >
      <div className="mt-0.5 flex-shrink-0">{style.icon}</div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="ml-2 mt-0.5 rounded-full p-1 opacity-50 hover:bg-white/10 hover:opacity-100 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
