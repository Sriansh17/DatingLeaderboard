import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Heart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <Heart className="h-16 w-16 text-pink-300 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <p className="text-muted-foreground mb-6">
          Oops! This page got lost. Maybe it ran off with your partner? 😄
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
