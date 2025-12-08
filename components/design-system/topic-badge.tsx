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
      className={`bg-transparent border-pink-600 text-pink-600 ${className}`}
    >
      {topic.code && <span className='font-mono mr-1.5'>{topic.code}</span>}
      {topic.label}
    </Badge>
  );
}
