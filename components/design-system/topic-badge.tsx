import { Badge } from '@/components/ui/badge';

interface Topic {
  code: string | null;
  label: string;
  color?: string | null;
}

interface TopicBadgeProps {
  topic: Topic;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function TopicBadge({ topic, variant = 'primary', className = '' }: TopicBadgeProps) {
  return (
    <Badge
      variant='outline'
      className={`bg-transparent border-pink-600 text-pink-600 whitespace-normal leading-tight h-auto py-1 ${className}`}
    >
      <span className='inline-flex flex-wrap items-start gap-1'>
        {topic.code && <span className='font-mono text-xs shrink-0'>{topic.code}</span>}
        <span className='break-words'>{topic.label}</span>
      </span>
    </Badge>
  );
}
