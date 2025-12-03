'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import type { Proposal, ProposalStatus, SubmissionWindow, MainArea, Review, SubmissionWindowStatus } from '@/app/generated/prisma';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trash2, Pencil, Send, Eye } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { deleteProposalAction, submitProposalAction } from '@/lib/actions/proposal-actions';
import { toast } from 'sonner';
import { useRouter } from '@/app/i18n/navigation';
import { useState } from 'react';

interface ProposalWithRelations extends Proposal {
  submissionWindow: SubmissionWindow;
  mainArea: MainArea;
  reviews: Review[];
}

interface ProposalListProps {
  proposals: ProposalWithRelations[];
  windowName?: string;
  windowStatus: SubmissionWindowStatus;
}

const statusColors: Record<ProposalStatus, string> = {
  DRAFT: 'bg-gray-500',
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-yellow-500',
  ACCEPTED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  PRIORITIZED: 'bg-purple-500'
};

const statusLabels: Record<ProposalStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  PRIORITIZED: 'Prioritized'
};


function SubmitProposalButton({ proposalId, proposalTitle }: { proposalId: string; proposalTitle: string }) {
  const router = useRouter();

  const { execute: submitProposal, status } = useAction(submitProposalAction, {
    onSuccess: () => {
      toast.success('Proposal submitted successfully');
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to submit proposal');
    }
  });

  const handleSubmit = () => {
    submitProposal({ id: proposalId });
  };

  return (
    <Tooltip>
      <AlertDialog>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button size='sm' variant='default' disabled={status === 'executing'}>
              <Send className='h-4 w-4' />
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit "{proposalTitle}"? Once submitted, you cannot modify it or submit another proposal for this submission window. This action is final.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              {status === 'executing' ? 'Submitting...' : 'Submit Proposal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <TooltipContent>
        <p>Submit proposal</p>
      </TooltipContent>
    </Tooltip>
  );
}

function DeleteProposalButton({ proposalId, proposalTitle }: { proposalId: string; proposalTitle: string }) {
  const router = useRouter();

  const { execute: deleteProposal, status } = useAction(deleteProposalAction, {
    onSuccess: () => {
      toast.success('Draft deleted successfully');
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to delete draft');
    }
  });

  const handleDelete = () => {
    deleteProposal({ id: proposalId });
  };

  return (
    <Tooltip>
      <AlertDialog>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button size='sm' variant='destructive' disabled={status === 'executing'}>
              <Trash2 className='h-4 w-4' />
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{proposalTitle}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              {status === 'executing' ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <TooltipContent>
        <p>Delete draft</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function ProposalList({ proposals, windowStatus }: ProposalListProps) {
  if (proposals.length === 0) {
    return (
      <div className='text-center py-12 text-muted-foreground'>
        <p>No proposals yet</p>
      </div>
    );
  }

  return (
    <div className='border rounded-lg overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-32'>Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className='w-48'>Main Topic</TableHead>
            <TableHead className='w-32'>Created</TableHead>
            <TableHead className='w-32'>Submitted</TableHead>
            <TableHead className='w-48 text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell className='w-32'>
                <Badge className={statusColors[proposal.status]}>
                  {statusLabels[proposal.status]}
                </Badge>
              </TableCell>
              <TableCell className='font-medium'>
                <div className='overflow-x-auto whitespace-nowrap'>
                  {proposal.title}
                </div>
              </TableCell>
              <TableCell className='w-48'>{proposal.mainArea.label}</TableCell>
              <TableCell className='w-32'>
                {new Date(proposal.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className='w-32'>
                {proposal.submittedAt
                  ? new Date(proposal.submittedAt).toLocaleDateString()
                  : '-'}
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex gap-2 justify-end w-[180px] ml-auto'>
                  <TooltipProvider>
                    {windowStatus === 'OPEN' && proposal.status === 'DRAFT' && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/submission/${proposal.id}/edit`}>
                              <Button size='sm' variant='outline'>
                                <Pencil className='h-4 w-4' />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit draft</p>
                          </TooltipContent>
                        </Tooltip>
                        <SubmitProposalButton proposalId={proposal.id} proposalTitle={proposal.title} />
                        <DeleteProposalButton proposalId={proposal.id} proposalTitle={proposal.title} />
                      </>
                    )}
                    {windowStatus !== 'OPEN' && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/submission/${proposal.id}`}>
                              <Button size='sm' variant='outline'>
                                <Eye className='h-4 w-4' />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View proposal</p>
                          </TooltipContent>
                        </Tooltip>
                        {proposal.status === 'DRAFT' && (
                          <DeleteProposalButton proposalId={proposal.id} proposalTitle={proposal.title} />
                        )}
                      </>
                    )}
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
