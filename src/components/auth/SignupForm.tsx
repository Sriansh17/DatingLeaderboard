'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

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
      // Create profile entry
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: username,
      });

      if (profileError) {
        addToast('Account created but profile setup needs attention', 'warning');
      }
    }

    addToast('Account created! Check your email to verify. ❤️', 'success');
    router.push('/auth/login');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="username"
        label="Username"
        placeholder="lovestruck42"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={6}
        required
      />
      <Button type="submit" loading={loading} className="w-full">
        Create Account
      </Button>
    </form>
  );
}
