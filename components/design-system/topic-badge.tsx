import { Badge } from '@/components/ui/badge';

interface Topic {
  code: string | null;
  label: string;
  color: string | null;
}

interface TopicBadgeProps {
  topic: Topic;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function TopicBadge({ topic, variant = 'primary', className = '' }: TopicBadgeProps) {
  const isPrimary = variant === 'primary';

  const style = isPrimary && topic.color
    ? {
        backgroundColor: `${topic.color}15`,
        borderColor: topic.color,
        color: topic.color
      }
    : undefined;

  return (
    <Badge variant='outline' style={style} className={className}>
      {topic.code && <span className='font-mono mr-1.5'>{topic.code}</span>}
      {topic.label}
    </Badge>
  );
}
