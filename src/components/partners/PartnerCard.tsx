'use client';

import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime } from '@/lib/utils/format';
import type { Partner } from '@/types/database';

interface PartnerCardProps {
  partner: Partner;
  onDelete?: (id: string) => void;
}

const relationshipLabels: Record<string, string> = {
  spouse: 'Spouse',
  partner: 'Partner',
  boyfriend: 'Boyfriend',
  girlfriend: 'Girlfriend',
  other: 'Other',
};

export function PartnerCard({ partner, onDelete }: PartnerCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {partner.avatar_url ? (
          <Avatar src={partner.avatar_url} alt={partner.name} size="md" />
        ) : (
          <span className="text-3xl">{partner.emoji}</span>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{partner.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info">{relationshipLabels[partner.relationship]}</Badge>
            <span className="text-xs text-gray-400">
              Added {formatRelativeTime(partner.created_at)}
            </span>
          </div>
        </div>
      </div>
      {onDelete && (
        <Button variant="ghost" size="sm" onClick={() => onDelete(partner.id)}>
          Remove
        </Button>
      )}
    </Card>
  );
}
