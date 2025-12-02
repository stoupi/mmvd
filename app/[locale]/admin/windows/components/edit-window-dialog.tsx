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
    submissionStart: Date;
    submissionEnd: Date;
    reviewDeadline: Date;
    status: WindowStatus;
  };
}

export function EditWindowDialog({ window }: EditWindowDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(submissionWindowSchema),
    defaultValues: {
      name: window.name,
      submissionStart: window.submissionStart as any,
      submissionEnd: window.submissionEnd as any,
      reviewDeadline: window.reviewDeadline as any
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
                name='submissionStart'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Start Date</FormLabel>
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
                name='submissionEnd'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission End Date</FormLabel>
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
                    <FormDescription className='text-xs'>
                      Must be after start date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='reviewDeadline'
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
                  <FormDescription className='text-xs'>
                    Must be after submission end date
                  </FormDescription>
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
