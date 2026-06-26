'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { UserPlus, UserCheck, Check, X, Loader2 } from 'lucide-react';
import type { ConnectionStatus } from '@/types/database';

interface ConnectButtonProps {
  targetUserId: string;
  initialStatus: ConnectionStatus;
  requestId?: string;
  onStatusChange?: (newStatus: ConnectionStatus, requestId?: string) => void;
}

export function ConnectButton({ targetUserId, initialStatus, requestId, onStatusChange }: ConnectButtonProps) {
  const [status, setStatus] = useState<ConnectionStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const sendRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/connections/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('pending_sent');
        onStatusChange?.('pending_sent', data.data?.id);
        addToast('Connection request sent!', 'success');
      } else {
        addToast(data.error || 'Failed to send request', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (action: 'accepted' | 'rejected') => {
    if (!requestId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/connections/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'accepted') {
          setStatus('connected');
          onStatusChange?.('connected');
          addToast('Connected! They\'re now in your Inner Circle.', 'success');
        } else {
          setStatus('none');
          onStatusChange?.('none');
          addToast('Request declined', 'info');
        }
      } else {
        addToast(data.error || 'Failed to respond', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('none');
        onStatusChange?.('none');
        addToast('Connection removed', 'info');
      } else {
        addToast(data.error || 'Failed to remove', 'error');
      }
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'none') {
    return (
      <Button variant="primary" size="sm" onClick={sendRequest} loading={loading}>
        <UserPlus className="h-4 w-4" /> Connect
      </Button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <Button variant="outline" size="sm" disabled>
        <UserCheck className="h-4 w-4" /> Invite Sent
      </Button>
    );
  }

  if (status === 'pending_received') {
    return (
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={() => respondToRequest('accepted')} loading={loading}>
          <Check className="h-4 w-4" /> Accept
        </Button>
        <Button variant="ghost" size="sm" onClick={() => respondToRequest('rejected')} loading={loading} className="text-muted-foreground">
          <X className="h-4 w-4" /> Decline
        </Button>
      </div>
    );
  }

  // connected
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
        <UserCheck className="h-3.5 w-3.5" /> In Your Circle
      </span>
      <button
        onClick={removeConnection}
        disabled={loading}
        className="text-[10px] text-muted-foreground hover:text-destructive underline transition-colors"
      >
        Remove
      </button>
    </div>
  );
}
