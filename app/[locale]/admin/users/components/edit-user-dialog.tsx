'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { updateUserProfileAction } from '@/lib/actions/admin-actions';
import { updateUserProfileSchema } from '@/lib/schemas/admin';
import type { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

type FormData = Omit<z.infer<typeof updateUserProfileSchema>, 'userId'>;

interface EditUserDialogProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    affiliation: string | null;
    centreCode: string | null;
    centreName: string | null;
  };
}

export function EditUserDialog({ user }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(updateUserProfileSchema.omit({ userId: true })),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      affiliation: user.affiliation || '',
      centreCode: user.centreCode || '',
      centreName: user.centreName || ''
    }
  });

  const { execute, status } = useAction(updateUserProfileAction, {
    onSuccess: () => {
      toast.success('User updated successfully');
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update user');
    }
  });

  const handleSubmit = (data: FormData) => {
    execute({ userId: user.id, ...data });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm'>
          <Edit className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update user information for {user.email}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder='John' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='affiliation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliation</FormLabel>
                  <FormControl>
                    <Input placeholder='University Hospital' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='centreCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centre Code</FormLabel>
                  <FormControl>
                    <Input placeholder='001' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='centreName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centre Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Paris Centre' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={status === 'executing'}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={status === 'executing'}>
                {status === 'executing' ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
