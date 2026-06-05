import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { Heart } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Heart className="h-10 w-10 text-pink-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Join LoveBoard</h1>
          <p className="text-sm text-gray-500 mt-1">Start celebrating your partner today</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <SignupForm />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-pink-500 hover:text-pink-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
