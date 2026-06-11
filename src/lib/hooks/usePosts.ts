'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/types/database';
import type { CreatePostPayload, AIScoreResult } from '@/types/api';

const supabase = createClient();

async function fetchPosts(userId?: string): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select('*, partner:partners(*)')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`/api/posts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch post');
  console.log('[fetchPost] Got post:', id, 'likes_count:', json.data?.likes_count, 'has_liked:', json.data?.has_liked);
  return json.data;
}

async function createPost(payload: CreatePostPayload & { user_id: string }) {
  // First, get AI score
  const scoreResponse = await fetch('/api/ai/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: payload.description }),
  });

  if (!scoreResponse.ok) {
    const errData = await scoreResponse.json().catch(() => ({}));
    const error = new Error(errData.error || 'Failed to get AI score');
    (error as any).flagged = errData.flagged;
    throw error;
  }
  const aiResult: AIScoreResult = await scoreResponse.json();

  // Fetch user's city to freeze on the post at creation time
  const { data: profile } = await supabase
    .from('profiles')
    .select('city')
    .eq('id', payload.user_id)
    .single();

  // Then, create the post with the score + frozen city
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: payload.user_id,
      partner_id: payload.partner_id,
      description: payload.description,
      is_public: payload.is_public ?? true,
      ai_score: aiResult.score,
      ai_feedback: aiResult.feedback,
      ai_explanation: JSON.stringify(aiResult.breakdown),
      post_city: profile?.city || null,
    })
    .select('*, partner:partners(*)')
    .single();

  if (error) throw error;
  return { post: data, aiResult };
}

export function usePosts(userId?: string) {
  return useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchPosts(userId),
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostPayload & { user_id: string }) =>
      createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['explore-posts'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
    },
  });
}

// Hook for toggling likes on posts
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      console.log('[useLikePost] Toggling like for post:', postId);
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (!res.ok) {
        const error = await res.json();
        console.error('[useLikePost] API error:', error);
        throw new Error('Failed to toggle like');
      }
      const data = await res.json();
      console.log('[useLikePost] API response:', data);
      return { postId, ...data };
    },
    onSuccess: (data) => {
      console.log('[useLikePost] Success, invalidating queries for post:', data.postId);
      // Invalidate all post queries to refetch with updated like counts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', data.postId] });
      queryClient.invalidateQueries({ queryKey: ['explore-posts'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['explore-posts'] });
      queryClient.refetchQueries({ queryKey: ['post', data.postId] });
      console.log('[useLikePost] Refetch triggered');
    },
    onError: (error) => {
      console.error('[useLikePost] Mutation error:', error);
    },
  });
}
