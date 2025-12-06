'use client';

import { useState } from 'react';
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
import { AssignReviewersDialog } from './assign-reviewers-dialog';
import { UserPlus } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  submittedAt: Date | null;
  piUser: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  centre: {
    code: string;
    name: string;
  } | null;
  mainArea: {
    id: string;
    label: string;
    color: string | null;
  };
  reviews: Array<{
    id: string;
    isDraft: boolean;
    deadline: Date;
    reviewer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  }>;
}

interface Reviewer {
  id: string;
  name: string;
  email: string;
  assignmentCount: number;
  hasTopicMatch: boolean;
}

interface ProposalsReviewTableProps {
  proposals: Proposal[];
  reviewers: Reviewer[];
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getReviewerName(reviewer: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  if (reviewer.firstName && reviewer.lastName) {
    return `${reviewer.firstName} ${reviewer.lastName}`;
  }
  return reviewer.email;
}

export function ProposalsReviewTable({ proposals, reviewers }: ProposalsReviewTableProps) {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const handleAssignReviewers = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setAssignDialogOpen(true);
  };

  return (
    <>
      <div className='rounded-md border bg-white overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>Centre</TableHead>
              <TableHead className='w-[300px]'>Title</TableHead>
              <TableHead className='w-[150px]'>Main Topic</TableHead>
              <TableHead className='w-[200px]'>Principal Investigator</TableHead>
              <TableHead className='w-[120px]'>Submitted</TableHead>
              <TableHead className='w-[150px]'>Reviewer 1</TableHead>
              <TableHead className='w-[150px]'>Reviewer 2</TableHead>
              <TableHead className='w-[150px]'>Reviewer 3</TableHead>
              <TableHead className='w-[100px] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center py-8 text-muted-foreground'>
                  No submitted proposals in this window
                </TableCell>
              </TableRow>
            ) : (
              proposals.map((proposal) => {
                const piName =
                  proposal.piUser.firstName && proposal.piUser.lastName
                    ? `${proposal.piUser.firstName} ${proposal.piUser.lastName}`
                    : proposal.piUser.email;

                const reviewer1 = proposal.reviews[0];
                const reviewer2 = proposal.reviews[1];
                const reviewer3 = proposal.reviews[2];

                return (
                  <TableRow key={proposal.id}>
                    <TableCell className='font-medium'>{proposal.centre?.code || 'N/A'}</TableCell>
                    <TableCell>
                      <div className='max-w-[300px] truncate' title={proposal.title}>
                        {proposal.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: proposal.mainArea.color || '#6b7280'
                        }}
                      >
                        {proposal.mainArea.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='max-w-[200px] truncate' title={piName}>
                        {piName}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(proposal.submittedAt)}</TableCell>
                    <TableCell>
                      {reviewer1 ? (
                        <div className='flex flex-col gap-1'>
                          <div
                            className='max-w-[150px] truncate text-sm'
                            title={getReviewerName(reviewer1.reviewer)}
                          >
                            {getReviewerName(reviewer1.reviewer)}
                          </div>
                          {reviewer1.isDraft && (
                            <Badge variant='outline' className='text-xs bg-yellow-50 w-fit'>
                              Draft
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className='text-sm text-muted-foreground'>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {reviewer2 ? (
                        <div className='flex flex-col gap-1'>
                          <div
                            className='max-w-[150px] truncate text-sm'
                            title={getReviewerName(reviewer2.reviewer)}
                          >
                            {getReviewerName(reviewer2.reviewer)}
                          </div>
                          {reviewer2.isDraft && (
                            <Badge variant='outline' className='text-xs bg-yellow-50 w-fit'>
                              Draft
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className='text-sm text-muted-foreground'>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {reviewer3 ? (
                        <div className='flex flex-col gap-1'>
                          <div
                            className='max-w-[150px] truncate text-sm'
                            title={getReviewerName(reviewer3.reviewer)}
                          >
                            {getReviewerName(reviewer3.reviewer)}
                          </div>
                          {reviewer3.isDraft && (
                            <Badge variant='outline' className='text-xs bg-yellow-50 w-fit'>
                              Draft
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className='text-sm text-muted-foreground'>-</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleAssignReviewers(proposal)}
                      >
                        <UserPlus className='h-4 w-4 mr-1' />
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedProposal && (
        <AssignReviewersDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          proposal={selectedProposal}
          reviewers={reviewers}
        />
      )}
    </>
  );
}
