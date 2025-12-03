'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ExternalLink } from 'lucide-react';
import { Link } from '@/app/i18n/navigation';
import type { ProposalStatus } from '@prisma/client';

interface Proposal {
  id: string;
  title: string;
  centreCode: string;
  status: ProposalStatus;
  submittedAt: Date | null;
  secondaryTopics: string[];
  piUser: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    centreCode: string | null;
  };
  mainArea: {
    id: string;
    label: string;
  };
  submissionWindow: {
    id: string;
    name: string;
    status: string;
  };
  reviews: {
    id: string;
    decision: string | null;
    status: string;
  }[];
}

interface ProposalsTableProps {
  proposals: Proposal[];
}

const statusColors = {
  DRAFT: 'bg-gray-500',
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-yellow-500',
  ACCEPTED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  PRIORITIZED: 'bg-purple-500'
};

const statusLabels = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  PRIORITIZED: 'Prioritized'
};

export function ProposalsTable({ proposals }: ProposalsTableProps) {
  const [columnWidths, setColumnWidths] = useState({
    centreCode: 100,
    title: 350,
    mainTopic: 180,
    secondary: 200,
    window: 180,
    status: 120,
    actions: 80
  });

  const resizingColumn = useRef<string | null>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback(
    (columnKey: keyof typeof columnWidths, e: React.MouseEvent) => {
      resizingColumn.current = columnKey;
      startX.current = e.clientX;
      startWidth.current = columnWidths[columnKey];
      e.preventDefault();
    },
    [columnWidths]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingColumn.current) return;

      const diff = e.clientX - startX.current;
      const newWidth = Math.max(50, startWidth.current + diff);

      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn.current!]: newWidth
      }));
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    resizingColumn.current = null;
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className='rounded-md border bg-white overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: columnWidths.centreCode }} className='relative'>
              Centre Code
              <div
                className='absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors'
                onMouseDown={(e) => handleMouseDown('centreCode', e)}
              />
            </TableHead>
            <TableHead style={{ width: columnWidths.title }} className='relative'>
              Title
              <div
                className='absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors'
                onMouseDown={(e) => handleMouseDown('title', e)}
              />
            </TableHead>
            <TableHead style={{ width: columnWidths.mainTopic }} className='relative'>
              Main Topic
              <div
                className='absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors'
                onMouseDown={(e) => handleMouseDown('mainTopic', e)}
              />
            </TableHead>
            <TableHead style={{ width: columnWidths.secondary }} className='relative'>
              Secondary
              <div
                className='absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors'
                onMouseDown={(e) => handleMouseDown('secondary', e)}
              />
            </TableHead>
            <TableHead style={{ width: columnWidths.window }} className='relative'>
              Window
              <div
                className='absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors'
                onMouseDown={(e) => handleMouseDown('window', e)}
              />
            </TableHead>
            <TableHead style={{ width: columnWidths.status }} className='relative'>
              Status
              <div
                className='absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors'
                onMouseDown={(e) => handleMouseDown('status', e)}
              />
            </TableHead>
            <TableHead style={{ width: columnWidths.actions }} className='text-right'>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => {
            return (
              <TableRow key={proposal.id}>
                <TableCell style={{ width: columnWidths.centreCode }}>
                  <Badge variant='outline'>{proposal.centreCode}</Badge>
                </TableCell>
                <TableCell style={{ width: columnWidths.title }}>
                  <div className='font-medium'>{proposal.title}</div>
                </TableCell>
                <TableCell style={{ width: columnWidths.mainTopic }}>
                  <Badge variant='secondary'>{proposal.mainArea.label}</Badge>
                </TableCell>
                <TableCell style={{ width: columnWidths.secondary }}>
                  {proposal.secondaryTopics.length > 0 ? (
                    <div className='flex flex-col gap-1'>
                      {proposal.secondaryTopics.map((topic, index) => (
                        <Badge key={index} variant='outline' className='text-xs'>
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className='text-sm text-muted-foreground'>-</span>
                  )}
                </TableCell>
                <TableCell style={{ width: columnWidths.window }}>
                  <div className='text-sm'>{proposal.submissionWindow.name}</div>
                </TableCell>
                <TableCell style={{ width: columnWidths.status }}>
                  <Badge className={statusColors[proposal.status]}>
                    {statusLabels[proposal.status]}
                  </Badge>
                </TableCell>
                <TableCell style={{ width: columnWidths.actions }} className='text-right'>
                  <Link href={`/submission/${proposal.id}`}>
                    <Button variant='ghost' size='sm'>
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
