'use client';

import { useAction } from 'next-safe-action/hooks';
import { updateWindowStatusAction } from '@/lib/actions/admin-actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { WindowStatus } from '@prisma/client';

interface WindowStatusSelectProps {
  window: {
    id: string;
    status: WindowStatus;
  };
}

const statusLabels: Record<string, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed'
};

export function WindowStatusSelect({ window }: WindowStatusSelectProps) {
  const { execute, status } = useAction(updateWindowStatusAction, {
    onSuccess: () => {
      toast.success('Window status updated successfully');
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update window status');
    }
  });

  const handleStatusChange = (newStatus: string) => {
    execute({ id: window.id, status: newStatus as WindowStatus });
  };

  // Display current status even if it's not OPEN or CLOSED
  const displayStatus = window.status === 'OPEN' || window.status === 'CLOSED'
    ? window.status
    : 'CLOSED';

  return (
    <Select
      value={displayStatus}
      onValueChange={handleStatusChange}
      disabled={status === 'executing'}
    >
      <SelectTrigger className='w-[140px]'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
