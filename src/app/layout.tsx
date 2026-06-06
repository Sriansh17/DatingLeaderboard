import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { AppDock } from '@/components/ui/AppDock';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-score' });

export const metadata: Metadata = {
  title: 'Love Leaderboard — Your Relationship Has a Score',
  description: 'Post one story. AI judges it. Compete with couples worldwide on the world\'s first relationship leaderboard.',
  themeColor: '#0D0A14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${playfair.variable} ${bebas.variable} font-sans antialiased bg-background text-foreground`}>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <div className="min-h-screen flex flex-col relative overflow-hidden">
                  <div className="flex-1 w-full mx-auto pb-24 md:pb-28 animate-in fade-in duration-700">
                    {children}
                  </div>
                  <AppDock />
                </div>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
