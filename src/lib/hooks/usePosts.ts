'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/types/database';
import type { CreatePostPayload, AIScoreResult } from '@/types/api';

const supabase = createClient();

async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, partner:partners(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchPost(id: string): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, partner:partners(*), profile:profiles(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

async function createPost(payload: CreatePostPayload & { user_id: string }) {
  // First, get AI score
  const scoreResponse = await fetch('/api/ai/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: payload.description }),
  });

  if (!scoreResponse.ok) throw new Error('Failed to get AI score');
  const aiResult: AIScoreResult = await scoreResponse.json();

  // Then, create the post with the score
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
    })
    .select('*, partner:partners(*)')
    .single();

  if (error) throw error;
  return { post: data, aiResult };
}

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostPayload & { user_id: string }) =>
      createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
    },
  });
}
