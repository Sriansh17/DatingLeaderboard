'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Spinner } from '@/components/ui/Spinner';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const { profile, loading: authLoading } = useUser();
  const router = useRouter();

  if (authLoading) return <Spinner size="lg" className="mx-auto mt-20" />;
  if (!profile) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="mb-4">Profile not found.</p>
        <p className="text-sm">Please log in again or check your database settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/profile"
        className="mb-6 rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors inline-flex items-center gap-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Profile
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-6">Edit Profile</h1>

      <ProfileForm
        profile={profile}
        onSuccess={() => router.push('/profile')}
      />
    </div>
  );
}
