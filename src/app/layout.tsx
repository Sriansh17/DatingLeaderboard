import type { Metadata, Viewport } from 'next';
import { DM_Sans, Playfair_Display, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AtmosphereProvider } from '@/components/providers/AtmosphereProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { ShareProvider } from '@/components/providers/ShareProvider';
import { ClientLayoutWrapper } from '@/components/layout/ClientLayoutWrapper';
import { AnonymousModeProvider } from '@/components/providers/AnonymousModeProvider';
import { ConfirmProvider } from '@/components/ui/ConfirmModal';
import { ServiceWorkerRegister } from '@/components/ui/ServiceWorkerRegister';


const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-score' });

export const metadata: Metadata = {
  title: 'Fond — Your Relationship Has a Score',
  description: 'Post one story. AI judges it. Compete with couples worldwide on the world\'s first relationship leaderboard.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#FCFAF8',  // matches --background in globals.css :root
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${playfair.variable} ${bebas.variable} font-sans antialiased bg-background text-foreground min-h-dvh`}>
        <QueryProvider>
          <ThemeProvider>
            <AtmosphereProvider>
              <AuthProvider>
                <ToastProvider>
                  <ShareProvider>
                    <ConfirmProvider>
                    <AnonymousModeProvider>
                      <ClientLayoutWrapper>
                        {children}
                      </ClientLayoutWrapper>
                    </AnonymousModeProvider>
                    </ConfirmProvider>
                  </ShareProvider>
                </ToastProvider>
              </AuthProvider>
            </AtmosphereProvider>
          </ThemeProvider>
        </QueryProvider>
        <ServiceWorkerRegister />
        {/* Scroll-reveal observer — powers .reveal-up and .reveal-up-stagger */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var obs = new IntersectionObserver(function(entries){
              entries.forEach(function(e){
                if(e.isIntersecting){ e.target.classList.add('is-visible'); obs.unobserve(e.target); }
              });
            }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
            document.querySelectorAll('.reveal-up, .reveal-up-stagger > *').forEach(function(el){ obs.observe(el); });
            var mo = new MutationObserver(function(){ document.querySelectorAll('.reveal-up:not(.is-visible), .reveal-up-stagger > *:not(.is-visible)').forEach(function(el){ obs.observe(el); }); });
            mo.observe(document.body, { childList: true, subtree: true });
          })();
        ` }} />
      </body>
    </html>
  );
}
