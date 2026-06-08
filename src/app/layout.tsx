import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AtmosphereProvider } from '@/components/providers/AtmosphereProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { ShareProvider } from '@/components/providers/ShareProvider';
import { AppDock } from '@/components/ui/AppDock';


const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-score' });

export const metadata: Metadata = {
  title: 'Fond — Your Relationship Has a Score',
  description: 'Post one story. AI judges it. Compete with couples worldwide on the world\'s first relationship leaderboard.',
  themeColor: '#FFF5F5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${playfair.variable} ${bebas.variable} font-sans antialiased bg-background text-foreground`}>
        <QueryProvider>
          <ThemeProvider>
            <AtmosphereProvider>
              <AuthProvider>
                <ToastProvider>
                  <ShareProvider>
                    <div className="min-h-screen flex flex-col relative">
                      <div className="flex-1 w-full mx-auto pb-28 md:pb-32">
                        {children}
                      </div>
                      <AppDock />
                    </div>
                  </ShareProvider>
                </ToastProvider>
              </AuthProvider>
            </AtmosphereProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
