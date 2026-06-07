import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden bg-background text-foreground">
      {/* Immersive Glowing Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#E92B54] opacity-20 mix-blend-screen blur-[120px] animate-pulse-glow" />
        <div className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-gold opacity-10 mix-blend-screen blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-[#E92B54] opacity-10 mix-blend-screen blur-[140px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col h-full justify-between sm:justify-center">
          
          <div className="text-center sm:mb-12 mt-12 sm:mt-0">
            <h1 className="font-display text-5xl italic font-bold tracking-tight text-foreground leading-tight">
              Welcome back to <br />
              <span className="text-[#E92B54]">Fond</span>
            </h1>
            <p className="text-muted-foreground mt-4 text-sm font-medium">
              Continue sharing your story.
            </p>
          </div>

          <div className="mt-auto sm:mt-0 space-y-6">
            <LoginForm />

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-white hover:text-[#E92B54] font-bold transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
