'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatRelativeTime, getScoreColor, getScoreBgColor } from '@/lib/utils/format';
import { Sparkles, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import type { Post } from '@/types/database';

interface PostDetailProps {
  post: Post;
}

export function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  const { user } = useUser();
  const { addToast } = useToast();

  const scoreColor = post.ai_score ? getScoreColor(post.ai_score) : 'text-gray-400';
  const scoreBg = post.ai_score ? getScoreBgColor(post.ai_score) : 'bg-gray-300';

  let breakdown: Record<string, number> = {};
  try {
    if (post.ai_explanation) breakdown = JSON.parse(post.ai_explanation);
  } catch {}

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    const supabase = createClient();
    await supabase.from('posts').delete().eq('id', post.id);
    addToast('Post deleted', 'success');
    router.push('/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Score Hero */}
      <div className="text-center py-8">
        <div className={`w-24 h-24 rounded-3xl ${scoreBg} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <span className="text-3xl font-bold text-white">{post.ai_score || '?'}</span>
        </div>
        <h1 className={`text-2xl font-bold ${scoreColor}`}>
          {post.ai_score ? `${post.ai_score}/100` : 'Not yet scored'}
        </h1>
        {post.partner && (
          <p className="text-gray-500 mt-1">
            {post.partner.emoji} {post.partner.name}
          </p>
        )}
      </div>

      {/* AI Feedback */}
      {post.ai_feedback && (
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-primary/30 dark:border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary dark:text-primary">LoveScore AI</span>
          </div>
          <p className="text-foreground/90 italic">{post.ai_feedback}</p>
        </Card>
      )}

      {/* Description */}
      <Card>
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{post.description}</p>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
          <span>{formatRelativeTime(post.created_at)}</span>
          <span>•</span>
          <Badge variant={post.is_public ? 'success' : 'default'}>
            {post.is_public ? 'Public' : 'Private'}
          </Badge>
        </div>
      </Card>

      {/* Breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <Card>
          <h3 className="font-semibold text-foreground mb-4">Score Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground capitalize w-32">
                  {key.replace('_', ' ')}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-accent rounded-full transition-all duration-1000"
                    style={{ width: `${(value / getMax(key)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground/90 w-8 text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      {user && post.user_id === user.id && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}

function getMax(key: string): number {
  const maxes: Record<string, number> = {
    thoughtfulness: 20,
    romance: 15,
    effort: 15,
    uniqueness: 10,
    emotional_impact: 10,
    ethical_boundaries: 15,
    genuineness: 10,
    equality: 10,
    safety: 5,
  };
  return maxes[key] || 15;
}
