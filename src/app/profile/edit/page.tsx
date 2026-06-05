'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useUser();
  const { addToast } = useToast();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setCity(profile.city || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.trim(),
        full_name: fullName.trim(),
        bio: bio.trim(),
        city: city.trim(),
      })
      .eq('id', user.id);

    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Profile updated!', 'success');
      await refreshProfile();
      router.push('/profile');
    }
    setSaving(false);
  };

  if (authLoading) return <Spinner size="lg" className="mx-auto mt-20" />;

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-pink-500 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Edit Profile</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <Input
          id="username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          id="fullName"
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Textarea
          id="bio"
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
        />
        <Input
          id="city"
          label="City"
          placeholder="e.g., Mumbai"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Button type="submit" loading={saving} className="w-full">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
