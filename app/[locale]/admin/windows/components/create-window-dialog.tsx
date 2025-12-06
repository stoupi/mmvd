'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { createSubmissionWindowAction } from '@/lib/actions/admin-actions';
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
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

type FormData = z.infer<typeof submissionWindowSchema>;

export function CreateWindowDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(submissionWindowSchema),
    defaultValues: {
      name: '',
      submissionOpenAt: new Date() as any,
      submissionCloseAt: new Date() as any,
      nextWindowOpensAt: undefined
    }
  });

  const { execute, status } = useAction(createSubmissionWindowAction, {
    onSuccess: () => {
      toast.success('Submission window created successfully');
      setOpen(false);
      form.reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to create submission window');
    }
  });

  const handleSubmit = (data: FormData) => {
    execute(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='h-4 w-4 mr-2' />
          New Submission Window
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Create Submission Window</DialogTitle>
          <DialogDescription>
            Create a new submission period for proposals
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
                {status === 'executing' ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
