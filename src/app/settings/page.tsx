'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Settings, LogOut, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const { signOut } = useUser();
  const { addToast } = useToast();

  const handleUpgrade = () => {
    addToast('Payment integration coming soon!', 'info');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-pink-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      </div>

      {/* Account */}
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Account</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={handleUpgrade}>
            <CreditCard className="h-4 w-4" />
            Premium Plan (Coming Soon)
          </Button>
          <Button variant="danger" className="w-full justify-start" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </Card>

      {/* About */}
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">About LoveBoard</h2>
        <p className="text-sm text-gray-500">
          LoveBoard is a social app where you share what your partner did for you today.
          Our AI scores each gesture, and partners get ranked on local, city, and global leaderboards.
        </p>
        <p className="text-xs text-gray-400 mt-3">Version 1.0.0 • Made with ❤️</p>
      </Card>
    </div>
  );
}
