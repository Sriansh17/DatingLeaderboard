import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Heart } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Heart className="h-10 w-10 text-pink-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue sharing the love</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-pink-500 hover:text-pink-600 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
