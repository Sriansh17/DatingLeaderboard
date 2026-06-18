'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/types/database';
import type { CreatePostPayload } from '@/types/api';

const supabase = createClient();

async function fetchPosts(userId?: string): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select('*, partner:partners(*)')
    .eq('is_archived', false)
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
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partner_id: payload.partner_id,
      description: payload.description,
      is_public: payload.is_public,
      timezone_offset_minutes: new Date().getTimezoneOffset(),
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const error = new Error(errData.error || 'Failed to get AI score');
    (error as any).flagged = errData.flagged;
    (error as any).code = errData.code;
    throw error;
  }

  const json = await response.json();
  if (!json.success) {
    const error = new Error(json.error || 'Failed to create post');
    (error as any).flagged = json.flagged;
    (error as any).code = json.code;
    throw error;
  }

  return { post: json.data, aiResult: json.aiResult };
}

export function usePosts(userId?: string) {
  return useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchPosts(userId),
  });
}

export function useArchivedPosts(userId: string | undefined) {
  return useQuery({
    queryKey: ['archived-posts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('posts')
        .select('*, partner:partners(*)')
        .eq('user_id', userId)
        .eq('is_archived', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Post[];
    },
    enabled: !!userId,
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
