'use client';

import { NotificationBell } from '@/components/notifications/NotificationBell';

/**
 * Notification bell intended for page headers.
 * Renders inline — parent container handles positioning.
 */
export function PageBell() {
  return (
    <div className="relative">
      <NotificationBell />
    </div>
  );
}
