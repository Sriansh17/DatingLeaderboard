"use client";

import { Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'heart' | 'sparkle' | 'skeleton';
  text?: string | string[];
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export function Spinner({ size = 'md', className, variant = 'heart', text }: SpinnerProps) {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (Array.isArray(text) && text.length > 1) {
      const interval = setInterval(() => {
        setTextIndex((i) => (i + 1) % text.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [text]);

  const currentText = Array.isArray(text) ? text[textIndex] : text;

  if (variant === 'skeleton') {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-4">
          <div className={cn("rounded-full bg-elevated/50 relative overflow-hidden", sizeClasses[size])}>
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-elevated/50 rounded w-1/3 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>
            <div className="h-3 bg-elevated/50 rounded w-1/2 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
        <div className="h-24 bg-elevated/50 rounded-2xl w-full relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-6', className)}>
      <div className="relative flex items-center justify-center">
        {variant === 'heart' ? (
          <>
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0, 0.25, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-[-50%] bg-blush rounded-full blur-lg z-0 pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className={cn('text-blush fill-blush/30 relative z-10', sizeClasses[size])} />
            </motion.div>
          </>
        ) : (
          <motion.div
            animate={{ filter: ['brightness(1)', 'brightness(1.5) drop-shadow(0 0 10px rgba(255,215,0,0.6))', 'brightness(1)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className={cn('text-gold relative z-10', sizeClasses[size])} />
          </motion.div>
        )}
      </div>
      {currentText && (
        <div className="h-6 relative overflow-visible flex justify-center w-full">
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={currentText}
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4 }}
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-mono text-muted-foreground text-center absolute whitespace-nowrap"
            >
              {currentText}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
