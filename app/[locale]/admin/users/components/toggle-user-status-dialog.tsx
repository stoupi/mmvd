'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { updateUserStatusAction } from '@/lib/actions/admin-actions';
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
import { Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ToggleUserStatusDialogProps {
  userId: string;
  userName: string;
  currentStatus: boolean;
}

export function ToggleUserStatusDialog({
  userId,
  userName,
  currentStatus
}: ToggleUserStatusDialogProps) {
  const [open, setOpen] = useState(false);

  const { execute, status } = useAction(updateUserStatusAction, {
    onSuccess: () => {
      toast.success(
        currentStatus ? 'User deactivated successfully' : 'User activated successfully'
      );
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update user status');
    }
  });

  const handleToggle = () => {
    execute({ userId, isActive: !currentStatus });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {currentStatus ? (
          <Button variant='ghost' size='sm'>
            <Ban className='h-4 w-4' />
          </Button>
        ) : (
          <Button variant='ghost' size='sm'>
            <CheckCircle className='h-4 w-4' />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {currentStatus ? 'Deactivate User' : 'Activate User'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {currentStatus ? (
              <>
                Are you sure you want to deactivate <strong>{userName}</strong>? They will
                no longer be able to access the platform.
              </>
            ) : (
              <>
                Are you sure you want to activate <strong>{userName}</strong>? They will
                regain access to the platform.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggle} disabled={status === 'executing'}>
            {status === 'executing'
              ? 'Processing...'
              : currentStatus
                ? 'Deactivate'
                : 'Activate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
