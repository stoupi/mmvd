'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import type { Proposal, ProposalStatus, SubmissionWindow, MainArea, Review } from '@/app/generated/prisma';
import { TopicBadge } from '@/components/design-system/topic-badge';
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
import { Trash2, Pencil, Send, Eye, FileDown } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { deleteProposalAction, submitProposalAction } from '@/lib/actions/proposal-actions';
import { toast } from 'sonner';
import { useRouter } from '@/app/i18n/navigation';

interface ProposalWithRelations extends Proposal {
  submissionWindow: SubmissionWindow;
  mainArea: MainArea;
  reviews: Review[];
}

interface CurrentWindowProposalsProps {
  proposals: ProposalWithRelations[];
  windowStatus: 'OPEN' | 'CLOSED';
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
            <AlertDialogTitle className='text-2xl text-gray-900'>Confirmation of proposal submission</AlertDialogTitle>
            <div className='text-gray-900 space-y-4 pt-2'>
              <div className='font-semibold text-base'>
                Are you sure you want to submit this proposal?
              </div>
              <div>
                <div className='text-sm mb-2'>
                  Once submitted:
                </div>
                <ul className='text-sm space-y-1 list-disc list-inside pl-2'>
                  <li>You <strong>cannot modify</strong> this proposal</li>
                  <li>You <strong>cannot submit another proposal</strong> for this submission window</li>
                  <li>This action is <strong className='text-pink-600'>final and irreversible</strong></li>
                </ul>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              {status === 'executing' ? 'Submitting...' : 'Confirm Submission'}
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
            <AlertDialogTitle className='text-2xl text-gray-900'>Draft deletion</AlertDialogTitle>
            <div className='text-gray-900 space-y-4 pt-2'>
              <div className='font-semibold text-base'>
                Are you sure you want to delete "{proposalTitle}"?
              </div>
              <div className='text-sm'>
                This action is <strong className='text-red-600'>permanent and cannot be undone</strong>.
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='hover:bg-red-50 hover:text-red-600'>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-red-600 text-white hover:bg-red-700'>
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

export function CurrentWindowProposals({ proposals, windowStatus }: CurrentWindowProposalsProps) {
  if (proposals.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        <p>No proposals for this window yet</p>
      </div>
    );
  }

  const hasSubmittedProposal = proposals.some(proposal => proposal.status !== 'DRAFT');

  return (
    <div className='border rounded-lg overflow-x-auto'>
      <Table className='table-fixed w-full'>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[120px]'>Status</TableHead>
            <TableHead className='w-auto'>Title</TableHead>
            <TableHead className='w-[180px]'>Main Topic</TableHead>
            <TableHead className='w-[120px]'>Created</TableHead>
            <TableHead className='w-[120px]'>Submitted</TableHead>
            <TableHead className='w-[200px] text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell className='w-[120px]'>
                <Badge className={statusColors[proposal.status]}>
                  {statusLabels[proposal.status]}
                </Badge>
              </TableCell>
              <TableCell className='font-medium'>
                <div className='overflow-x-auto whitespace-nowrap'>
                  {proposal.title}
                </div>
              </TableCell>
              <TableCell className='w-[180px]'>
                <TopicBadge topic={proposal.mainArea} />
              </TableCell>
              <TableCell className='w-[120px]'>
                {new Date(proposal.createdAt).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric'
                })}
              </TableCell>
              <TableCell className='w-[120px]'>
                {proposal.submittedAt
                  ? new Date(proposal.submittedAt).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    })
                  : '-'}
              </TableCell>
              <TableCell className='text-right w-[200px]'>
                <div className='flex gap-2 justify-end'>
                  <TooltipProvider>
                    {windowStatus === 'OPEN' && proposal.status === 'DRAFT' && !hasSubmittedProposal && (
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
                    {windowStatus === 'OPEN' && proposal.status === 'DRAFT' && hasSubmittedProposal && (
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
                            <p>View draft</p>
                          </TooltipContent>
                        </Tooltip>
                        <DeleteProposalButton proposalId={proposal.id} proposalTitle={proposal.title} />
                      </>
                    )}
                    {proposal.status !== 'DRAFT' && (
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a href={`/api/proposals/${proposal.id}/export-pdf`} download>
                              <Button size='sm' variant='outline'>
                                <FileDown className='h-4 w-4' />
                              </Button>
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export to PDF</p>
                          </TooltipContent>
                        </Tooltip>
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
