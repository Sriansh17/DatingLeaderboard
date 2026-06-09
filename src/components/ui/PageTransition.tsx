'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isVisible, setIsVisible] = useState(true);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      // Fade out
      setIsVisible(false);
      const t = setTimeout(() => {
        setDisplayChildren(children);
        setPrevPath(pathname);
        setIsVisible(true);
      }, 150); // half the transition — exit then enter
      return () => clearTimeout(t);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? 'blur(0px)' : 'blur(4px)',
        transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.18s ease, filter 0.18s ease, transform 0.18s ease',
        willChange: 'opacity, filter, transform',
      }}
      className="w-full"
    >
      {displayChildren}
    </div>
  );
}
