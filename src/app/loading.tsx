import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Spinner size="lg" text={["LOADING...", "PREPARING YOUR EXPERIENCE...", "ALMOST THERE..."]} />
    </div>
  );
}
