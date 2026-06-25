'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Send, Users } from 'lucide-react';
import type { Circle } from '@/types/database';

interface InviteToCliqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUsername: string;
}

export function InviteToCliqueModal({ isOpen, onClose, targetUserId, targetUsername }: InviteToCliqueModalProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCircles();
    }
  }, [isOpen]);

  const fetchCircles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/circles');
      const data = await res.json();
      if (data.success) {
        // Only show circles where user is creator or admin
        const manageable = data.data.filter(
          (c: Circle) => c.created_by === targetUserId || c.members?.some(m => m.role === 'admin' && m.user_id === targetUserId)
        );
        setCircles(manageable);
      }
    } catch {
      addToast('Failed to load cliques', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (circleId: string) => {
    setInvitingId(circleId);
    try {
      const res = await fetch(`/api/circles/${circleId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Invited @${targetUsername} to your clique!`, 'success');
        setCircles(prev => prev.filter(c => c.id !== circleId));
      } else {
        addToast(data.error || 'Failed to invite', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invite @${targetUsername}`}>
      <div className="space-y-3 min-h-[120px]">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : circles.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">You don&apos;t have any cliques you can invite to.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Create a clique first, then invite friends!</p>
          </div>
        ) : (
          circles.map((circle) => (
            <div
              key={circle.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40 hover:bg-card/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{circle.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{circle.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {circle.member_count ?? 0}/{circle.max_members} members
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendInvite(circle.id)}
                loading={invitingId === circle.id}
              >
                <Send className="h-3.5 w-3.5" /> Invite
              </Button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
