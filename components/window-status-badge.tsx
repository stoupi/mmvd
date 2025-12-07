import { Badge } from '@/components/ui/badge';
import type { WindowStatus } from '@prisma/client';

interface WindowStatusBadgeProps {
  status: WindowStatus;
  showFullText?: boolean;
}

export function WindowStatusBadge({ status, showFullText = false }: WindowStatusBadgeProps) {
  const isOpen = status === 'OPEN';
  const className = isOpen ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
  const text = showFullText
    ? isOpen
      ? 'Submission Window Open'
      : 'Submission Window Closed'
    : isOpen
      ? 'Open'
      : 'Closed';

  return <Badge className={className}>{text}</Badge>;
}
