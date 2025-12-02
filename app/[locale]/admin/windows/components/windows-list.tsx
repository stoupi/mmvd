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
  submissionStart: Date;
  submissionEnd: Date;
  reviewDeadline: Date;
  status: WindowStatus;
  _count: {
    proposals: number;
  };
}

interface WindowsListProps {
  windows: SubmissionWindow[];
}

const statusColors = {
  PLANNED: 'bg-gray-500',
  OPEN: 'bg-green-500',
  CLOSED: 'bg-orange-500',
  REVIEWING: 'bg-blue-500',
  COMPLETED: 'bg-purple-500'
};

const statusLabels = {
  PLANNED: 'Planned',
  OPEN: 'Open',
  CLOSED: 'Closed',
  REVIEWING: 'Under Review',
  COMPLETED: 'Completed'
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
            <div className='grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground'>
              <div>
                <span className='font-medium'>Submission:</span>{' '}
                {new Date(window.submissionStart).toLocaleDateString()} -{' '}
                {new Date(window.submissionEnd).toLocaleDateString()}
              </div>
              <div>
                <span className='font-medium'>Review deadline:</span>{' '}
                {new Date(window.reviewDeadline).toLocaleDateString()}
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
