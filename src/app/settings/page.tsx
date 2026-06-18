'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Settings, LogOut, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const { signOut, profile, refreshProfile } = useUser();
  const { addToast } = useToast();

  const handleUpgrade = async () => {
    try {
      if (profile?.is_premium) {
        addToast('You are already on Premium.', 'info');
        return;
      }

      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_premium: true }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upgrade to premium');
      }

      await refreshProfile();
      addToast('Premium activated. You can now post without limits.', 'success');
    } catch (error: any) {
      addToast(error.message || 'Upgrade failed. Please try again.', 'error');
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      {/* Account */}
      <Card>
        <h2 className="font-semibold text-foreground mb-4">Account</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={handleUpgrade}>
            <CreditCard className="h-4 w-4" />
            {profile?.is_premium ? 'Premium Active' : 'Upgrade to Premium'}
          </Button>
          <Button variant="danger" className="w-full justify-start" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </Card>

      {/* About */}
      <Card>
        <h2 className="font-semibold text-foreground mb-2">About Fond</h2>
        <p className="text-sm text-gray-500">
          Fond is the world&apos;s first relationship leaderboard. Post one story. AI judges it.
          Couples compete in your city — and on the planet. Your relationship has a score. What&apos;s yours?
        </p>
        <p className="text-xs text-gray-400 mt-3">Version 1.0.0 • Made with ❤️</p>
      </Card>
    </div>
  );
}
