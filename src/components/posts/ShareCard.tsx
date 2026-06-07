'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Share2 } from 'lucide-react';
import type { Post } from '@/types/database';
import { useUser } from '@/components/providers/AuthProvider';
import { ShareExperienceModal } from '@/components/share/ShareExperienceModal';

interface ShareCardProps {
  post: Post;
  rank?: number;
}

export function ShareCard({ post, rank }: ShareCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useUser();

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Share2 className="h-4 w-4 mr-2" />
        Share Verdict
      </Button>

      {isOpen && (
        <ShareExperienceModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          post={post}
          profileName={profile?.username || 'anonymous'}
          rank={rank}
          city={profile?.city}
        />
      )}
    </>
  );
}
