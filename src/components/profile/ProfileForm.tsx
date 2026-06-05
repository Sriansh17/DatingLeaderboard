'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

interface ProfileFormProps {
  profile: Profile;
  onSuccess?: () => void;
}

export function ProfileForm({ profile, onSuccess }: ProfileFormProps) {
  const [username, setUsername] = useState(profile.username || '');
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [city, setCity] = useState(profile.city || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.trim(),
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        city: city.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (error) {
      addToast(error.message, 'error');
      setLoading(false);
      return;
    }

    addToast('Profile updated! ✨', 'success');
    setLoading(false);
    if (onSuccess) onSuccess();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="username"
        label="Username"
        placeholder="lovestruck42"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <Input
        id="fullName"
        label="Full Name"
        placeholder="Alex Johnson"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <Textarea
        id="bio"
        label="Bio"
        placeholder="Tell the world about your relationship..."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={3}
      />

      <Input
        id="city"
        label="City"
        placeholder="New York, NY"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <Button type="submit" loading={loading} className="w-full">
        Save Changes ✨
      </Button>
    </form>
  );
}
