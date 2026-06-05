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
  if (!profile) return <Spinner size="lg" className="mx-auto mt-20" />;

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

      <ProfileForm
        profile={profile}
        onSuccess={() => router.push('/profile')}
      />
    </div>
  );
}
