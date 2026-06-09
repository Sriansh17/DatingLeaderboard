'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      addToast(error.message, 'error');
      setLoading(false);
      return;
    }

    addToast('Welcome back! ❤️', 'success');
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-12 py-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-blush focus:bg-black/10 dark:focus:bg-white/10 transition-all backdrop-blur-md shadow-[inset_0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-12 py-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-blush focus:bg-black/10 dark:focus:bg-white/10 transition-all backdrop-blur-md shadow-[inset_0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        </div>
      </div>

      <div className="flex justify-end mt-1">
        <button
          type="button"
          onClick={async () => {
            if (!email) {
              addToast('Enter your email address first.', 'error');
              return;
            }
            const supabase = createClient();
            await supabase.auth.resetPasswordForEmail(email);
            addToast('Password reset link sent — check your inbox.', 'success');
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Forgot password?
        </button>
      </div>
      
      <button 
        type="submit" 
        disabled={loading} 
        className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50"
      >
        <span>{loading ? 'Signing in...' : 'Sign In'}</span>
        {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
      </button>
    </form>
  );
}
