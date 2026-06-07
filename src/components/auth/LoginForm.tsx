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
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/70 dark:text-muted-foreground z-10 pointer-events-none" />
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-12 py-4 text-foreground placeholder:text-foreground/50 dark:text-muted-foreground outline-none focus:border-blush focus:bg-white/10 transition-all backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/70 dark:text-muted-foreground z-10 pointer-events-none" />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-12 py-4 text-foreground placeholder:text-foreground/50 dark:text-muted-foreground outline-none focus:border-blush focus:bg-white/10 transition-all backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={loading} 
        className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#E92B54] py-4 font-bold text-white shadow-[0_0_20px_-5px_rgba(233,43,84,0.5)] transition-transform hover:scale-[1.02] disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]"
      >
        <span>Sign In</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
