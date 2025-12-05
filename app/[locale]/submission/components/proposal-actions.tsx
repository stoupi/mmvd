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
            <AlertDialogAction onClick={handleSubmit} disabled={isExecuting}>
              {isExecuting ? 'Submitting...' : 'Confirm Submission'}
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
            <AlertDialogTitle className='text-2xl text-gray-900'>Draft deletion</AlertDialogTitle>
            <div className='text-gray-900 space-y-4 pt-2'>
              <div className='font-semibold text-base'>
                Are you sure you want to delete this draft?
              </div>
              <div className='text-sm'>
                This action is <strong className='text-red-600'>permanent and cannot be undone</strong>.
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='hover:bg-red-50 hover:text-red-600'>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isExecuting}
              className='bg-red-600 text-white hover:bg-red-700'
            >
              {isExecuting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
