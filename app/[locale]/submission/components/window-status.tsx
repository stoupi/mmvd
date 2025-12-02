import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SubmissionWindow, WindowStatus as WindowStatusType } from '@/app/generated/prisma';
import { Calendar, Clock } from 'lucide-react';

interface WindowStatusProps {
  window: SubmissionWindow;
}

const statusColors: Record<WindowStatusType, string> = {
  UPCOMING: 'bg-gray-500',
  OPEN: 'bg-green-500',
  REVIEW: 'bg-blue-500',
  RESPONSE: 'bg-yellow-500',
  CLOSED: 'bg-red-500'
};

const statusLabels: Record<WindowStatusType, string> = {
  UPCOMING: 'Upcoming',
  OPEN: 'Open for Submissions',
  REVIEW: 'Under Review',
  RESPONSE: 'Response Period',
  CLOSED: 'Closed'
};

export function WindowStatus({ window }: WindowStatusProps) {
  return (
    <Card className='mb-6'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>{window.name}</CardTitle>
          <Badge className={statusColors[window.status]}>
            {statusLabels[window.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid md:grid-cols-2 gap-4'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <div>
              <p className='text-sm font-medium'>Submission Period</p>
              <p className='text-sm text-muted-foreground'>
                {new Date(window.submissionOpenAt).toLocaleDateString()} -{' '}
                {new Date(window.submissionCloseAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-muted-foreground' />
            <div>
              <p className='text-sm font-medium'>Review Deadline</p>
              <p className='text-sm text-muted-foreground'>
                {new Date(window.reviewDeadlineDefault).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
