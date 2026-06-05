import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LoveBoard — Share & Score Love',
  description: 'Share what your partner did for you today, get an AI score, and compete on leaderboards!',
  manifest: '/manifest.json',
  themeColor: '#f43f5e',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LoveBoard',
  },
  openGraph: {
    title: 'LoveBoard',
    description: 'Share what your partner did for you today, get an AI score, and compete on leaderboards!',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <div className="min-h-screen pb-16 md:pb-0">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  {children}
                </main>
                <BottomNav />
              </div>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
