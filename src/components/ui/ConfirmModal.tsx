'use client';

import { useState, useCallback, createContext, useContext, useRef } from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Trash2, Archive } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const variantStyles = {
  danger: {
    icon: Trash2,
    bg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
    button: 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_-4px_rgba(244,63,94,0.4)]',
  },
  warning: {
    icon: Archive,
    bg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    button: 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_0_20px_-4px_rgba(245,158,11,0.4)]',
  },
  default: {
    icon: AlertTriangle,
    bg: 'bg-primary/10',
    iconColor: 'text-primary',
    button: 'bg-primary text-primary-foreground shadow-[var(--shadow-glow)]',
  },
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: '', message: '' });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(false);
  }, []);

  const variant = variantStyles[options.variant || 'default'];
  const IconComponent = variant.icon;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal isOpen={isOpen} onClose={handleCancel} className="max-w-sm">
        <div className="text-center py-4 px-2">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center ${variant.bg}`}>
            <IconComponent className={`h-7 w-7 ${variant.iconColor}`} />
          </div>

          {/* Title */}
          <h3 className="font-display italic text-2xl text-foreground mb-3">
            {options.title}
          </h3>

          {/* Message */}
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {options.message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleCancel}
              className="flex-1 rounded-full border border-border bg-muted/50 text-foreground text-sm font-semibold py-3 hover:bg-muted transition-all hover:scale-[1.02]"
            >
              {options.cancelLabel || 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 rounded-full text-sm font-semibold py-3 transition-all hover:scale-[1.02] ${variant.button}`}
            >
              {options.confirmLabel || 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}
