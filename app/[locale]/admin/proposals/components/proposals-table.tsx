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
import { ExternalLink } from 'lucide-react';
import { Link } from '@/app/i18n/navigation';
import type { ProposalStatus } from '@prisma/client';

interface Proposal {
  id: string;
  title: string;
  centreCode: string;
  status: ProposalStatus;
  submittedAt: Date | null;
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
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>PI / Centre</TableHead>
            <TableHead>Main Area</TableHead>
            <TableHead>Window</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reviews</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => {
            const piName = proposal.piUser.firstName && proposal.piUser.lastName
              ? `${proposal.piUser.firstName} ${proposal.piUser.lastName}`
              : proposal.piUser.email;

            return (
              <TableRow key={proposal.id}>
                <TableCell>
                  <div className='font-medium'>{proposal.title}</div>
                  {proposal.submittedAt && (
                    <div className='text-xs text-muted-foreground'>
                      Submitted: {new Date(proposal.submittedAt).toLocaleDateString()}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>{piName}</div>
                  <Badge variant='outline' className='text-xs'>
                    {proposal.centreCode}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary'>{proposal.mainArea.label}</Badge>
                </TableCell>
                <TableCell>
                  <div className='text-sm'>{proposal.submissionWindow.name}</div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[proposal.status]}>
                    {statusLabels[proposal.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='text-sm'>
                    {proposal.reviews.length} {proposal.reviews.length === 1 ? 'review' : 'reviews'}
                  </div>
                </TableCell>
                <TableCell className='text-right'>
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
