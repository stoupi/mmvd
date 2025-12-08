'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { deleteProposalAction } from '@/lib/actions/admin-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteProposalDialogProps {
  proposalId: string;
  proposalTitle: string;
}

export function DeleteProposalDialog({ proposalId, proposalTitle }: DeleteProposalDialogProps) {
  const [open, setOpen] = useState(false);

  const { execute, status } = useAction(deleteProposalAction, {
    onSuccess: () => {
      toast.success('Proposal deleted successfully');
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to delete proposal');
    }
  });

  const handleDelete = () => {
    execute({ id: proposalId });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant='ghost' size='sm'>
          <Trash2 className='h-4 w-4 text-red-600' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the proposal <strong>&quot;{proposalTitle}&quot;</strong>? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={status === 'executing'}
            className='bg-red-600 hover:bg-red-700'
          >
            {status === 'executing' ? 'Deleting...' : 'Delete Proposal'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
