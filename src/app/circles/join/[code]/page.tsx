'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/components/providers/AuthProvider';
import { Spinner } from '@/components/ui/Spinner';
import { CheckCircle, XCircle, Users, Lock, ArrowLeft } from 'lucide-react';

export default function JoinCirclePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { user, loading: authLoading } = useUser();

  const [status, setStatus] = useState<'loading' | 'joining' | 'passcode' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [circleName, setCircleName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Wait for auth to load
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const returnUrl = `/circles/join/${code}`;
      router.replace(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }
    // User is logged in — try to join (will prompt for passcode if needed)
    setStatus('joining');
    handleJoin();
  }, [authLoading, user]);

  const handleJoin = async (withPasscode?: string) => {
    try {
      const res = await fetch('/api/circles/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, passcode: withPasscode }),
      });
      const data = await res.json();

      if (data.success) {
        setCircleName(data.data.name);
        setStatus('success');
        setTimeout(() => {
          router.push(`/circles/${data.data.id}`);
        }, 1500);
      } else if (data.needs_passcode) {
        // API says a passcode is required
        setCircleName(data.circle_name || '');
        setPasscodeError(data.error?.includes('Incorrect') ? data.error : '');
        setStatus('passcode');
      } else if (data.expired) {
        setErrorMsg(data.error || 'This invite link has expired.');
        setStatus('error');
      } else {
        setErrorMsg(data.error || 'Failed to join circle');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setStatus('joining');
    handleJoin(passcode.trim());
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {/* Loading auth */}
        {status === 'loading' && (
          <div className="space-y-6">
            <Spinner size="lg" text={['CHECKING INVITE...']} />
          </div>
        )}

        {/* Joining */}
        {status === 'joining' && (
          <div className="space-y-6">
            <Spinner size="lg" text={['JOINING CIRCLE...']} />
            <p className="text-sm text-muted-foreground">Processing your invite...</p>
          </div>
        )}

        {/* Passcode required */}
        {status === 'passcode' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto border border-gold/30">
              <Lock className="h-10 w-10 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-2xl italic text-foreground mb-2">
                Passcode Required
              </h1>
              <p className="text-muted-foreground text-sm">
                {circleName ? (
                  <>Enter the passcode to join <span className="font-semibold text-foreground">{circleName}</span></>
                ) : (
                  'This circle requires a passcode to join.'
                )}
              </p>
            </div>
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <input
                type="text"
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setPasscodeError(''); }}
                placeholder="Enter passcode"
                maxLength={20}
                autoFocus
                className="w-full text-center rounded-xl border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-lg tracking-widest"
              />
              {passcodeError && (
                <p className="text-xs text-red-500">{passcodeError}</p>
              )}
              <button
                type="submit"
                disabled={!passcode.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 active:opacity-80 transition-opacity"
              >
                <Lock className="h-4 w-4" /> Join Circle
              </button>
            </form>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl italic text-foreground mb-2">You&apos;re in!</h1>
              <p className="text-muted-foreground">
                You&apos;ve joined <span className="font-semibold text-foreground">{circleName}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground/60">Redirecting to the circle...</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl italic text-foreground mb-2">Couldn&apos;t join</h1>
              <p className="text-muted-foreground text-sm">{errorMsg}</p>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <Link
                href="/circles"
                className="inline-flex items-center gap-2 rounded-full glass-btn text-sm hover:opacity-90 active:opacity-80 transition-opacity"
              >
                <Users className="h-4 w-4" /> My Bonds
              </Link>
              <button onClick={() => handleJoin()} className="text-sm text-primary hover:underline active:underline">
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
