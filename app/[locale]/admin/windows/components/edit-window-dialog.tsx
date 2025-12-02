'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { updateSubmissionWindowAction } from '@/lib/actions/admin-actions';
import { submissionWindowSchema } from '@/lib/schemas/admin';
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
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { WindowStatus } from '@prisma/client';

type FormData = z.infer<typeof submissionWindowSchema>;

interface EditWindowDialogProps {
  window: {
    id: string;
    name: string;
    submissionOpenAt: Date;
    submissionCloseAt: Date;
    reviewStartAt: Date;
    reviewDeadlineDefault: Date;
    responseDeadline: Date;
    nextWindowOpensAt: Date | null;
    status: WindowStatus;
  };
}

export function EditWindowDialog({ window }: EditWindowDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(submissionWindowSchema),
    defaultValues: {
      name: window.name,
      submissionOpenAt: window.submissionOpenAt as any,
      submissionCloseAt: window.submissionCloseAt as any,
      reviewStartAt: window.reviewStartAt as any,
      reviewDeadlineDefault: window.reviewDeadlineDefault as any,
      responseDeadline: window.responseDeadline as any,
      nextWindowOpensAt: window.nextWindowOpensAt as any
    }
  });

  const { execute, status } = useAction(updateSubmissionWindowAction, {
    onSuccess: () => {
      toast.success('Submission window updated successfully');
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update submission window');
    }
  });

  const handleSubmit = (data: FormData) => {
    execute({ id: window.id, ...data });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm'>
          <Edit className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit Submission Window</DialogTitle>
          <DialogDescription>
            Update the submission window details
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Window Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Q1 2025 Submission' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='submissionOpenAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Opens</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='submissionCloseAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Closes</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='reviewStartAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Starts</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='reviewDeadlineDefault'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Deadline</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='responseDeadline'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Deadline</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='nextWindowOpensAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Window Opens (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
