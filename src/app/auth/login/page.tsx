import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* Background — primary-dominant for login */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-primary opacity-20 mix-blend-screen blur-[120px] animate-pulse-glow" />
        <div className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-gold opacity-10 mix-blend-screen blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-primary opacity-10 mix-blend-screen blur-[140px]" />
      </div>

      {/* Top nav */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/"
          className="rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      </div>
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col h-full justify-between sm:justify-center">

          <div className="text-center sm:mb-10 mt-12 sm:mt-0">
            {/* Brand mark */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-gold" />
              <span className="font-display italic text-gold text-lg">Fond</span>
            </div>
            <h1 className="font-display text-5xl italic font-bold tracking-tight text-foreground leading-tight">
              Welcome back.
            </h1>
            <p className="text-muted-foreground mt-3 text-sm">
              Your rank won&apos;t climb itself.
            </p>
          </div>

          <div className="mt-auto sm:mt-0 space-y-5">
            <LoginForm />

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-foreground dark:text-white hover:text-primary font-bold transition-colors">
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
