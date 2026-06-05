import Link from 'next/link';
import { Heart, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
            <span>LoveBoard — Share & Score Love</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
            <Link href="/contact" className="hover:text-pink-500 transition-colors flex items-center gap-1">
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
