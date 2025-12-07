'use client';

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
import { Link } from '@/app/i18n/navigation';
import { ClipboardEdit, Eye, CheckCircle2, FileEdit } from 'lucide-react';
import { format, isPast } from 'date-fns';

interface Review {
  id: string;
  deadline: Date;
  status: string;
  isLate: boolean;
  completedAt: Date | null;
  decision: string | null;
  overlap: string | null;
  commentsForPI: string | null;
  proposal: {
    id: string;
    title: string;
    piUser: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
    mainArea: {
      label: string;
      color: string | null;
    };
    centre: {
      code: string;
      name: string;
    } | null;
  };
}

interface ReviewerProposalsTableProps {
  reviews: Review[];
}

export function ReviewerProposalsTable({ reviews }: ReviewerProposalsTableProps) {
  const formatDeadline = (deadline: Date) => {
    const date = new Date(deadline);
    const isOverdue = isPast(date);
    const formattedDate = format(date, 'PPP');

    return { formattedDate, isOverdue };
  };

  const getPiName = (piUser: Review['proposal']['piUser']) => {
    if (piUser.firstName && piUser.lastName) {
      return `${piUser.firstName} ${piUser.lastName}`;
    }
    return piUser.email;
  };

  return (
    <div className='rounded-md border bg-white overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[300px]'>Proposal Title</TableHead>
            <TableHead className='w-[150px]'>Main Topic</TableHead>
            <TableHead className='w-[200px]'>Principal Investigator</TableHead>
            <TableHead className='w-[200px]'>Centre</TableHead>
            <TableHead className='w-[150px]'>Deadline</TableHead>
            <TableHead className='w-[120px] text-center'>Status</TableHead>
            <TableHead className='w-[150px] text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => {
            const { formattedDate, isOverdue } = formatDeadline(review.deadline);
            const piName = getPiName(review.proposal.piUser);
            const isCompleted = review.status === 'COMPLETED';
            const isInProgress = !isCompleted && (
              review.decision !== null ||
              review.overlap !== null ||
              review.commentsForPI !== null
            );

            return (
              <TableRow key={review.id}>
                <TableCell>
                  <div className='max-w-[350px] truncate font-medium' title={review.proposal.title}>
                    {review.proposal.title}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: review.proposal.mainArea.color || '#6b7280'
                    }}
                  >
                    {review.proposal.mainArea.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='max-w-[200px] truncate' title={piName}>
                    {piName}
                  </div>
                </TableCell>
                <TableCell>
                  {review.proposal.centre ? (
                    <div className='max-w-[200px]'>
                      <div className='font-medium'>{review.proposal.centre.code}</div>
                      <div className='text-sm text-muted-foreground truncate' title={review.proposal.centre.name}>
                        {review.proposal.centre.name}
                      </div>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  <div className={isOverdue && !isCompleted ? 'text-red-600 font-medium' : ''}>
                    {formattedDate}
                    {isOverdue && !isCompleted && (
                      <div className='text-xs text-red-600'>Overdue</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className='text-center'>
                  {isCompleted ? (
                    <Badge className='bg-green-600'>
                      <CheckCircle2 className='h-3 w-3 mr-1' />
                      Completed
                    </Badge>
                  ) : isInProgress ? (
                    <Badge className='bg-gray-500'>
                      <FileEdit className='h-3 w-3 mr-1' />
                      In Progress
                    </Badge>
                  ) : (
                    <Badge variant='outline'>Pending</Badge>
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex gap-2 justify-end'>
                    {isCompleted ? (
                      <Link href={`/reviewing/${review.proposal.id}`}>
                        <Button size='sm' variant='outline'>
                          <Eye className='h-4 w-4 mr-1' />
                          View
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/reviewing/${review.proposal.id}`}>
                        <Button size='sm'>
                          <ClipboardEdit className='h-4 w-4 mr-1' />
                          Review
                        </Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
