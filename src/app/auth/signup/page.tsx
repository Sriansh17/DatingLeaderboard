import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { SignupForm } from '@/components/auth/SignupForm';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function SignupPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* Immersive Glowing Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-primary opacity-20 mix-blend-screen blur-[120px] animate-pulse-glow" />
        <div className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-gold opacity-10 mix-blend-screen blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-primary opacity-10 mix-blend-screen blur-[140px]" />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col h-full justify-between sm:justify-center">
          
          <div className="text-center sm:mb-12 mt-12 sm:mt-0">
            <h1 className="font-display text-4xl sm:text-5xl italic font-bold tracking-tight text-foreground leading-tight">
              Join <br />
              <span className="text-primary flex items-center justify-center gap-3 mt-2">
                <Sparkles className="h-10 w-10 text-gold" /> Fond
              </span>
            </h1>
            <p className="text-muted-foreground mt-4 text-sm font-medium px-4">
              Find genuine connections built on shared values, interests, and goals.
            </p>
          </div>

          <div className="mt-auto sm:mt-0 space-y-6">
            <SignupForm />

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-foreground dark:text-white hover:text-primary font-bold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
            
            <p className="text-[10px] text-center text-muted-foreground opacity-60">
              By continuing, you agree to Love Log's <br />
              Terms of Service and Privacy Policy
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
