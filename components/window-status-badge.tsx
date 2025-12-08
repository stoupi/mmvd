import { StatusBadge, getStatusVariant } from '@/components/design-system/status-badge';
import type { WindowStatus } from '@prisma/client';

interface WindowStatusBadgeProps {
  status: WindowStatus;
  showFullText?: boolean;
}

export function WindowStatusBadge({ status, showFullText = false }: WindowStatusBadgeProps) {
  const isOpen = status === 'OPEN';
  const text = showFullText
    ? isOpen
      ? 'Submission Window Open'
      : 'Submission Window Closed'
    : isOpen
      ? 'Open'
      : 'Closed';

  return <StatusBadge variant={getStatusVariant(status)} text={text} />;
}
