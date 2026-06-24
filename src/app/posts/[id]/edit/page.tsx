'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/lib/hooks/usePosts';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { data: post, isLoading } = usePost(params.id as string);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  if (isLoading) return <Spinner size="lg" text={["LOADING POST..."]} />
  if (!post) return <div className="text-center py-20 text-gray-500">Post not found</div>;

  // Set initial description
  if (!description && post.description) {
    setDescription(post.description);
  }

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('posts')
      .update({ description: description.trim() })
      .eq('id', params.id);

    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Post updated!', 'success');
      router.push(`/posts/${params.id}`);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-4">Edit Post</h1>

      <div className="space-y-4">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />
        <Button onClick={handleSave} loading={saving} className="w-full">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
