"use client";

import React, { createContext, useContext, useState } from 'react';
import { ShareStudio } from '@/components/share/ShareStudio';

export type ShareType = 'post' | 'rank' | 'score' | 'profile';

export interface ShareContent {
  username: string;
  partnerName?: string;
  avatarUrl?: string | null;
  headline?: string;
  verdict?: string;
  score?: number;
  rank?: number;
  city?: string;
  date?: string;
  streak?: number;
  bestScore?: number;
  totalPosts?: number;
  bio?: string | null;
  age?: string | null;
  gender?: string | null;
  occupation?: string | null;
  country?: string | null;
}

interface ShareData {
  type: ShareType;
  content: ShareContent;
}

interface ShareContextType {
  isOpen: boolean;
  shareData: ShareData | null;
  openShare: (type: ShareType, content: ShareContent) => void;
  closeShare: () => void;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);

  const openShare = (type: ShareType, content: ShareContent) => {
    setShareData({ type, content });
    setIsOpen(true);
  };

  const closeShare = () => {
    setIsOpen(false);
    // Add a tiny delay before clearing data so the exit animation looks smooth
    setTimeout(() => setShareData(null), 300);
  };

  return (
    <ShareContext.Provider value={{ isOpen, shareData, openShare, closeShare }}>
      {children}
      {shareData && <ShareStudio />}
    </ShareContext.Provider>
  );
}

export function useShare() {
  const context = useContext(ShareContext);
  if (context === undefined) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
}
