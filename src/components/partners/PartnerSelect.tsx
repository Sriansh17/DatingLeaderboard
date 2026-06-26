'use client';

import { cn } from '@/lib/utils/cn';
import { Avatar } from '@/components/ui/Avatar';
import type { Partner } from '@/types/database';

interface PartnerSelectProps {
  partners: Partner[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function PartnerSelect({ partners, selectedId, onSelect, className }: PartnerSelectProps) {
  if (partners.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No partners added yet. Add one first!</p>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-2', className)}>
      {partners.map((partner) => (
        <button
          key={partner.id}
          type="button"
          onClick={() => onSelect(partner.id)}
          className={cn(
            'p-3 rounded-xl border-2 text-center transition-all',
            selectedId === partner.id
              ? 'border-pink-500 bg-primary/10 dark:bg-primary/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-primary/40 active:border-primary/50'
          )}
        >
          {partner.avatar_url ? (
            <Avatar src={partner.avatar_url} alt={partner.name} size="sm" className="mx-auto" />
          ) : (
            <span className="text-2xl">{partner.emoji}</span>
          )}
          <p className="text-sm font-medium mt-1 truncate">{partner.name}</p>
        </button>
      ))}
    </div>
  );
}
