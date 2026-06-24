'use client';

import { usePathname } from 'next/navigation';
import { AppDock } from '@/components/ui/AppDock';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  
  // Matches AppDock's visibility logic exactly
  const showDock = pathname !== '/' && !pathname.startsWith('/auth') && !pathname.startsWith('/onboarding');
  
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className={`flex-1 w-full mx-auto ${showDock ? 'pb-28 md:pb-32' : ''}`}>
        {children}
      </div>
      <AppDock />
    </div>
  );
}
