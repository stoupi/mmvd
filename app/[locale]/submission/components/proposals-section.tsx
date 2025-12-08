'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import type { Proposal, ProposalStatus, SubmissionWindow, MainArea, Review, SubmissionWindowStatus } from '@/app/generated/prisma';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Pencil, Send, Eye, FileDown } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { deleteProposalAction, submitProposalAction } from '@/lib/actions/proposal-actions';
import { toast } from 'sonner';
import { useRouter } from '@/app/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProposalWithRelations extends Proposal {
  submissionWindow: SubmissionWindow;
  mainArea: MainArea;
  reviews: Review[];
}

interface ProposalsSectionProps {
  proposals: ProposalWithRelations[];
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

export function ProposalsSection({ proposals }: ProposalsSectionProps) {
  const [selectedWindow, setSelectedWindow] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const uniqueWindows = Array.from(
    new Map(
      proposals.map((proposal) => [
        proposal.submissionWindow.id,
        proposal.submissionWindow
      ])
    ).values()
  ).sort((a, b) => new Date(b.submissionOpenAt).getTime() - new Date(a.submissionOpenAt).getTime());

  const filteredProposals = proposals.filter((proposal) => {
    const matchesWindow = selectedWindow === 'all' || proposal.submissionWindowId === selectedWindow;
    const matchesStatus = selectedStatus === 'all' || proposal.status === selectedStatus;
    return matchesWindow && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Proposals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex gap-4 mb-6'>
          <div className='flex-1'>
            <label className='text-sm font-medium mb-2 block'>Filter by Window</label>
            <Select value={selectedWindow} onValueChange={setSelectedWindow}>
              <SelectTrigger>
                <SelectValue placeholder='All Windows' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Windows</SelectItem>
                {uniqueWindows.map((window) => (
                  <SelectItem key={window.id} value={window.id}>
                    {window.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex-1'>
            <label className='text-sm font-medium mb-2 block'>Filter by Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder='All Statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredProposals.length === 0 ? (
          <div className='text-center py-12 text-muted-foreground'>
            <p>No proposals found</p>
          </div>
        ) : (
          <div className='border rounded-lg overflow-x-auto'>
            <Table className='table-fixed w-full'>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[120px]'>Status</TableHead>
                  <TableHead className='w-auto'>Title</TableHead>
                  <TableHead className='w-[180px]'>Window</TableHead>
                  <TableHead className='w-[180px]'>Main Topic</TableHead>
                  <TableHead className='w-[120px]'>Created</TableHead>
                  <TableHead className='w-[120px]'>Submitted</TableHead>
                  <TableHead className='w-[200px] text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => {
                  const windowStatus = proposal.submissionWindow.status;
                  const hasSubmittedProposal = filteredProposals.some(
                    (p) => p.submissionWindowId === proposal.submissionWindowId && p.status === 'SUBMITTED'
                  );

                  return (
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
                      <TableCell className='w-[180px]'>{proposal.submissionWindow.name}</TableCell>
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
                                {!hasSubmittedProposal ? (
                                  <SubmitProposalButton proposalId={proposal.id} proposalTitle={proposal.title} />
                                ) : (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size='sm' variant='secondary' disabled>
                                        Already Submitted
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>You have already submitted a proposal for this window</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <DeleteProposalButton proposalId={proposal.id} proposalTitle={proposal.title} />
                              </>
                            )}
                            {windowStatus === 'OPEN' && proposal.status === 'SUBMITTED' && (
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
                                {proposal.status === 'SUBMITTED' && (
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
                                )}
                                {proposal.status === 'DRAFT' && (
                                  <DeleteProposalButton proposalId={proposal.id} proposalTitle={proposal.title} />
                                )}
                              </>
                            )}
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
