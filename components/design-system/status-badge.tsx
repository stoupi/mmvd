import { Badge } from '@/components/ui/badge';

export type StatusVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface StatusBadgeProps {
  variant: StatusVariant;
  text: string;
  className?: string;
}

export const statusVariantColors: Record<StatusVariant, string> = {
  success: 'bg-green-500 hover:bg-green-600 text-white',
  error: 'bg-red-500 hover:bg-red-600 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  info: 'bg-blue-500 hover:bg-blue-600 text-white',
  default: 'bg-gray-500 hover:bg-gray-600 text-white'
};

export function StatusBadge({ variant, text, className = '' }: StatusBadgeProps) {
  const variantClassName = statusVariantColors[variant];
  const combinedClassName = `${variantClassName} ${className}`.trim();

  return <Badge className={combinedClassName}>{text}</Badge>;
}

export function getStatusVariant(status: string): StatusVariant {
  const statusMap: Record<string, StatusVariant> = {
    OPEN: 'success',
    CLOSED: 'error',
    UPCOMING: 'info',
    COMPLETED: 'default',
    SUBMITTED: 'success',
    DRAFT: 'default',
    UNDER_REVIEW: 'info',
    ACCEPTED: 'success',
    REJECTED: 'error',
    PRIORITIZED: 'warning'
  };

  return statusMap[status] || 'default';
}
