import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Heart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <Heart className="h-16 w-16 text-pink-300 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">404</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Oops! This page got lost. Maybe it ran off with your partner? 😄
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
