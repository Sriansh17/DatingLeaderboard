import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased`}>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <div className="min-h-screen flex pb-16 md:pb-0">
                  <Sidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <main className="flex-1 overflow-x-hidden">
                      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                      </div>
                    </main>
                    <Footer />
                  </div>
                  <BottomNav />
                </div>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
