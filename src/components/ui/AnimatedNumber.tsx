"use client";

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  delay?: number;
  instant?: boolean;
}

export function AnimatedNumber({ value, className, delay = 0, instant = false }: AnimatedNumberProps) {
  const [mounted, setMounted] = useState(false);
  const spring = useSpring(0, {
    stiffness: 40,
    damping: 15,
    mass: 1,
    restDelta: 0.001
  });

  const display = useTransform(spring, (current) => current.toFixed(1));

  useEffect(() => {
    setMounted(true);
    if (!instant) {
      const timeout = setTimeout(() => {
        spring.set(value);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [spring, value, delay, instant]);

  if (instant) {
    return (
      <span className={className}>
        {mounted ? value.toFixed(1) : '0.0'}
      </span>
    );
  }

  return (
    <motion.span
      initial={{ filter: 'blur(20px)', opacity: 0 }}
      animate={{ filter: 'blur(0px)', opacity: 1 }}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {mounted ? <motion.span>{display}</motion.span> : '0.0'}
    </motion.span>
  );
}
