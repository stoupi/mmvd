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
  return (
    <div className='rounded-md border bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Centre Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Main Topic</TableHead>
            <TableHead>Secondary</TableHead>
            <TableHead>Window</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => {
            return (
              <TableRow key={proposal.id}>
                <TableCell>
                  <Badge variant='outline'>
                    {proposal.centreCode}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='font-medium max-w-md'>{proposal.title}</div>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary'>{proposal.mainArea.label}</Badge>
                </TableCell>
                <TableCell>
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
                <TableCell>
                  <div className='text-sm'>{proposal.submissionWindow.name}</div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[proposal.status]}>
                    {statusLabels[proposal.status]}
                  </Badge>
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
