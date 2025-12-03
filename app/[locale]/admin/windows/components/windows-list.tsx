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

const getStatusColor = (status: WindowStatus) => {
  return status === 'OPEN' ? 'bg-green-500' : 'bg-red-500';
};

const getStatusLabel = (status: WindowStatus) => {
  return status === 'OPEN' ? 'Open' : 'Closed';
};

export function WindowsList({ windows }: WindowsListProps) {
  return (
    <div className='space-y-4'>
      {windows.map((window) => (
        <div
          key={window.id}
          className='flex items-start justify-between p-4 border rounded-lg bg-white'
        >
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <h3 className='font-semibold'>{window.name}</h3>
              <Badge className={getStatusColor(window.status)}>
                {getStatusLabel(window.status)}
              </Badge>
              <Badge variant='outline'>
                {window._count.proposals} {window._count.proposals === 1 ? 'proposal submitted' : 'proposals submitted'}
              </Badge>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground'>
              <div>
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
