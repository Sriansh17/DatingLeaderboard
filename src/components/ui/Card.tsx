import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'glass p-4 sm:p-6 lg:p-8',
        hover && 'hover:-translate-y-1 active:translate-y-0 transition-transform duration-300',
        className
      )}
    >
      {children}
    </div>
  );
}
