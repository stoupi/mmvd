'use client';

import { useState } from 'react';
import { useRouter } from '@/app/i18n/navigation';
import { useAction } from 'next-safe-action/hooks';
import { submitProposalAction, deleteProposalAction } from '@/lib/actions/proposal-actions';
import { Button } from '@/components/ui/button';
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
import { Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProposalActionsProps {
  proposalId: string;
}

export function ProposalActions({ proposalId }: ProposalActionsProps) {
  const router = useRouter();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { execute: submitProposal, status: submitStatus } = useAction(
    submitProposalAction,
    {
      onSuccess: () => {
        toast.success('Proposal submitted successfully!');
        router.push('/submission');
        router.refresh();
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to submit proposal');
      }
    }
  );

  const { execute: deleteProposal, status: deleteStatus } = useAction(
    deleteProposalAction,
    {
      onSuccess: () => {
        toast.success('Proposal deleted successfully');
        router.push('/submission');
        router.refresh();
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to delete proposal');
      }
    }
  );

  const handleSubmit = () => {
    submitProposal({ id: proposalId });
    setIsSubmitDialogOpen(false);
  };

  const handleDelete = () => {
    deleteProposal({ id: proposalId });
    setIsDeleteDialogOpen(false);
  };

  const isExecuting = submitStatus === 'executing' || deleteStatus === 'executing';

  return (
    <div className='flex gap-2'>
      {/* Submit Dialog */}
      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button disabled={isExecuting}>
            <Send className='h-4 w-4 mr-2' />
            Submit Proposal
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Proposal?</AlertDialogTitle>
            <AlertDialogDescription className='space-y-2'>
              <p>
                Are you sure you want to submit this proposal? Once submitted:
              </p>
              <ul className='list-disc list-inside space-y-1 text-sm'>
                <li>You will <strong>not be able to edit</strong> the proposal</li>
                <li>You will <strong>not be able to delete</strong> the proposal</li>
                <li>The proposal will be sent for review</li>
                <li>You cannot submit another proposal for this submission window</li>
              </ul>
              <p className='font-medium mt-4'>
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isExecuting}>
              {isExecuting ? 'Submitting...' : 'Yes, Submit Proposal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant='outline' disabled={isExecuting}>
            <Trash2 className='h-4 w-4 mr-2' />
            Delete Draft
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this draft? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isExecuting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isExecuting ? 'Deleting...' : 'Yes, Delete Draft'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
