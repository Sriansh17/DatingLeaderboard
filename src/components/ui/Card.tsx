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
        'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6',
        hover && 'hover:shadow-lg hover:border-pink-200 dark:hover:border-pink-800 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}
