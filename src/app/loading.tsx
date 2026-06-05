import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Loading LoveBoard...</p>
      </div>
    </div>
  );
}
