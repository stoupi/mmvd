'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { deleteSubmissionWindowAction } from '@/lib/actions/admin-actions';
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

interface DeleteWindowDialogProps {
  windowId: string;
  windowName: string;
  proposalCount: number;
}

export function DeleteWindowDialog({
  windowId,
  windowName,
  proposalCount
}: DeleteWindowDialogProps) {
  const [open, setOpen] = useState(false);

  const { execute, status } = useAction(deleteSubmissionWindowAction, {
    onSuccess: () => {
      toast.success('Submission window deleted successfully');
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to delete submission window');
    }
  });

  const handleDelete = () => {
    execute({ id: windowId });
  };

  const canDelete = proposalCount === 0;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant='ghost' size='sm' disabled={!canDelete}>
          <Trash2 className='h-4 w-4' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Submission Window</AlertDialogTitle>
          <AlertDialogDescription>
            {canDelete ? (
              <>
                Are you sure you want to delete <strong>{windowName}</strong>? This action
                cannot be undone.
              </>
            ) : (
              <>
                Cannot delete <strong>{windowName}</strong> because it has{' '}
                {proposalCount} associated {proposalCount === 1 ? 'proposal' : 'proposals'}.
                Please delete those proposals first.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={status === 'executing'}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {status === 'executing' ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
