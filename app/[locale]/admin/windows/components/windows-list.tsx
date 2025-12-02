'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { EditWindowDialog } from './edit-window-dialog';
import { DeleteWindowDialog } from './delete-window-dialog';
import { WindowStatusSelect } from './window-status-select';
import type { WindowStatus } from '@prisma/client';

interface SubmissionWindow {
  id: string;
  name: string;
  submissionOpenAt: Date;
  submissionCloseAt: Date;
  reviewStartAt: Date;
  reviewDeadlineDefault: Date;
  responseDeadline: Date;
  nextWindowOpensAt: Date | null;
  status: WindowStatus;
  _count: {
    proposals: number;
  };
}

interface WindowsListProps {
  windows: SubmissionWindow[];
}

const statusColors = {
  UPCOMING: 'bg-gray-500',
  OPEN: 'bg-green-500',
  REVIEW: 'bg-blue-500',
  RESPONSE: 'bg-yellow-500',
  CLOSED: 'bg-orange-500'
};

const statusLabels = {
  UPCOMING: 'Upcoming',
  OPEN: 'Open',
  REVIEW: 'Under Review',
  RESPONSE: 'Response Period',
  CLOSED: 'Closed'
};

export function WindowsList({ windows }: WindowsListProps) {
  return (
    <div className='space-y-4'>
      {windows.map((window) => (
        <div
          key={window.id}
          className='flex items-start justify-between p-4 border rounded-lg'
        >
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <h3 className='font-semibold'>{window.name}</h3>
              <Badge className={statusColors[window.status]}>
                {statusLabels[window.status]}
              </Badge>
              <Badge variant='outline'>
                {window._count.proposals} {window._count.proposals === 1 ? 'proposal' : 'proposals'}
              </Badge>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground'>
              <div>
                <span className='font-medium'>Submission:</span>{' '}
                {new Date(window.submissionOpenAt).toLocaleDateString()} -{' '}
                {new Date(window.submissionCloseAt).toLocaleDateString()}
              </div>
              <div>
                <span className='font-medium'>Review:</span>{' '}
                {new Date(window.reviewStartAt).toLocaleDateString()} -{' '}
                {new Date(window.reviewDeadlineDefault).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2 ml-4'>
            <WindowStatusSelect window={window} />
            <EditWindowDialog window={window} />
            <DeleteWindowDialog
              windowId={window.id}
              windowName={window.name}
              proposalCount={window._count.proposals}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
