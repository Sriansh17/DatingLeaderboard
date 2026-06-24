'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft, Copy, Check, Diamond, Crown, Trophy, LogOut, UserMinus, Trash2 } from 'lucide-react';
import type { Circle, CircleMember } from '@/types/database';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  average_score: number;
  total_posts: number;
}

export default function CircleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { addToast } = useToast();

  const [circle, setCircle] = useState<Circle | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const circleId = params.id as string;

  useEffect(() => {
    if (!user || !circleId) return;
    fetchCircle();
    fetchLeaderboard();
  }, [user, circleId]);

  const fetchCircle = async () => {
    try {
      const res = await fetch(`/api/circles/${circleId}`);
      const data = await res.json();
      if (data.success) setCircle(data.data);
    } catch {
      addToast('Failed to load clique', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/circles/${circleId}/leaderboard`);
      const data = await res.json();
      if (data.success) setLeaderboard(data.data);
    } catch {
      // swallow
    }
  };

  const copyInviteLink = async () => {
    if (!circle) return;
    const link = `${window.location.origin}/circles/join/${circle.code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('Invite link copied!', 'success');
    } catch {
      addToast(`Invite code: ${circle.code}`, 'success');
    }
  };

  const handleLeave = async () => {
    if (!circle || leaving) return;
    if (!confirm('Leave this clique?')) return;
    setLeaving(true);
    try {
      const res = await fetch(`/api/circles/${circleId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Left the clique', 'success');
        router.push('/circles');
      } else {
        addToast(data.error || 'Failed to leave', 'error');
      }
    } catch {
      addToast('Failed to leave clique', 'error');
    } finally {
      setLeaving(false);
    }
  };

  const handleKick = async (userId: string, username: string) => {
    if (!confirm(`Remove @${username} from this circle?`)) return;
    try {
      const res = await fetch(`/api/circles/${circleId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: userId }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Removed @${username}`, 'success');
        fetchCircle();
        fetchLeaderboard();
      } else {
        addToast(data.error || 'Failed to remove', 'error');
      }
    } catch {
      addToast('Failed to remove member', 'error');
    }
  };

  const handleDelete = async () => {
    if (!circle || deleting) return;
    if (!confirm('Delete this entire clique? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/circles/${circleId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Clique deleted', 'success');
        router.push('/circles');
      } else {
        addToast(data.error || 'Failed to delete', 'error');
      }
    } catch {
      addToast('Failed to delete circle', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const isCreator = circle?.created_by === user?.id;
  const isMember = circle?.members?.some(m => m.user_id === user?.id);

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-gold" />;
    if (rank === 2) return <Trophy className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-4 w-4 text-amber-600" />;
    return null;
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-400';
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Sign in to view cliques.</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 flex justify-center">
        <Spinner size="lg" text={["LOADING CLIQUE..."]} />
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Clique not found.</p>
        <Link href="/circles" className="text-primary hover:underline">Back to Cliques</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back + Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/circles" className="p-2 rounded-full hover:bg-muted/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{circle.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{circle.name}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Diamond className="h-3 w-3" />
                {circle.member_count}/{circle.max_members} members
                {isCreator && (
                  <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[10px] font-semibold">Creator</span>
                )}
              </p>
            </div>
          </div>
        </div>
        {isMember && (
          isCreator ? (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 dark:border-red-900 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete Circle'}
            </button>
          ) : (
            <button
              onClick={handleLeave}
              disabled={leaving}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Leave
            </button>
          )
        )}
      </div>

      {/* Invite link */}
      <div className="mb-8 p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Invite Link</p>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-sm bg-muted/30 px-3 py-2 rounded-xl border border-border text-foreground truncate font-mono">
            {`${window.location.origin}/circles/join/${circle.code}`}
          </code>
          <button
            onClick={copyInviteLink}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {/* Expiry + Passcode info */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/70">
          {circle.invite_expires_at && (
            <span>
              Expires {new Date(circle.invite_expires_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          )}
          {circle.passcode && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Passcode required
            </span>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="mb-6">
        <h2 className="font-display text-xl italic text-foreground mb-4 flex items-center gap-2">
          <Diamond className="h-5 w-5" /> Members
        </h2>
        <div className="flex flex-wrap gap-2">
          {circle.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/40 text-sm"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center text-[10px] font-bold text-white">
                {(member.profile as any)?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-foreground">@{(member.profile as any)?.username || 'unknown'}</span>
              {member.role === 'creator' && <Crown className="h-3 w-3 text-gold" />}
              {isCreator && member.role !== 'creator' && member.user_id !== user.id && (
                <button
                  onClick={() => handleKick(member.user_id, (member.profile as any)?.username || 'unknown')}
                  className="p-0.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Remove member"
                >
                  <UserMinus className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <h2 className="font-display text-xl italic text-foreground mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-gold" /> Leaderboard
      </h2>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-border bg-card/40">
          <p className="text-muted-foreground text-sm">No scores yet. Members need to create posts first.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
          {leaderboard.map((entry, i) => {
            const isMe = entry.user_id === user.id;
            return (
              <div
                key={entry.user_id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i > 0 ? 'border-t border-border' : ''
                } ${isMe ? 'bg-primary/5' : ''} hover:bg-muted/20 transition-colors`}
              >
                {/* Rank */}
                <div className="w-10 text-center shrink-0">
                  {entry.rank <= 3 ? (
                    rankIcon(entry.rank)
                  ) : (
                    <span className="font-score text-lg text-muted-foreground">{entry.rank}</span>
                  )}
                </div>

                {/* Avatar + Name */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {entry.username[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-sm truncate">
                      @{entry.username}
                    </span>
                    {entry.role === 'creator' && <Crown className="h-3 w-3 text-gold shrink-0" />}
                    {isMe && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-semibold">You</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {entry.total_posts} {entry.total_posts === 1 ? 'post' : 'posts'}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <div className={`font-score text-xl ${scoreColor(entry.average_score)}`}>
                    {entry.average_score > 0 ? entry.average_score.toFixed(1) : '—'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
