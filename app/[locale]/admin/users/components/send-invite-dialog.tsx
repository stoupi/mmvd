'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { sendInvitationAction } from '@/lib/actions/admin-actions';
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
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

interface SendInviteDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export function SendInviteDialog({ userId, userName, userEmail }: SendInviteDialogProps) {
  const [open, setOpen] = useState(false);

  const { execute, status } = useAction(sendInvitationAction, {
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to send invitation');
    }
  });

  const handleSendInvite = () => {
    execute({ userId });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Mail className='h-4 w-4' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send Invitation</AlertDialogTitle>
          <AlertDialogDescription>
            Send an invitation email to <strong>{userName}</strong> ({userEmail}) to set up their account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSendInvite}
            disabled={status === 'executing'}
            className='bg-blue-600 hover:bg-blue-700'
          >
            {status === 'executing' ? 'Sending...' : 'Send Invitation'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
