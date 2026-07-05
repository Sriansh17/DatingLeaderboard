import Link from 'next/link';
import { Heart, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-transparent">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 sm:pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>Fond — Your Relationship Has a Score</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/contact" className="hover:text-primary transition-colors active:text-primary/80 flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              Contact
            </Link>
            <span className="hidden sm:inline">•</span>
            <span>Made with ❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
