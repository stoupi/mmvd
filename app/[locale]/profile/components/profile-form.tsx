'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { updateOwnProfileAction } from '@/lib/actions/profile-actions';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const affiliationSchema = z.object({
  affiliation: z.string().optional().transform(val => val === '' ? undefined : val)
});

type AffiliationFormData = z.infer<typeof affiliationSchema>;

interface ProfileFormProps {
  affiliation: string;
}

export function ProfileForm({ affiliation }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<AffiliationFormData>({
    resolver: zodResolver(affiliationSchema),
    defaultValues: {
      affiliation: affiliation || ''
    }
  });

  const { execute, status } = useAction(updateOwnProfileAction, {
    onSuccess: () => {
      toast.success('Affiliation updated successfully');
      setIsEditing(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update affiliation');
    }
  });

  const onSubmit = (data: AffiliationFormData) => {
    execute(data);
  };

  const handleCancel = () => {
    form.reset({ affiliation: affiliation || '' });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className='flex items-center justify-between'>
        <div className='w-48'>
          <span className='text-sm font-medium'>Affiliation</span>
        </div>
        <div className='flex-1'>
          <span className='text-sm'>{affiliation || '-'}</span>
        </div>
        <div className='w-32 flex justify-end'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setIsEditing(true)}
          >
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex items-start justify-between gap-4'>
          <div className='w-48'>
            <span className='text-sm font-medium'>Affiliation</span>
          </div>
          <div className='flex-1'>
            <FormField
              control={form.control}
              name='affiliation'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder='University Hospital' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='w-32 flex justify-end gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={handleCancel}
              disabled={status === 'executing'}
            >
              Cancel
            </Button>
            <Button type='submit' size='sm' disabled={status === 'executing'}>
              {status === 'executing' ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
