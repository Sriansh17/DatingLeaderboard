'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      addToast(error.message, 'error');
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: username,
      });

      if (profileError) {
        addToast('Account created but profile setup needs attention', 'warning');
      }
    }

    // Automatically push to onboarding instead of login 
    router.push('/onboarding');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-blush focus:bg-white/10 transition-all backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-blush focus:bg-white/10 transition-all backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="password"
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-blush focus:bg-white/10 transition-all backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={loading} 
        className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]"
      >
        <span>Create Account</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
