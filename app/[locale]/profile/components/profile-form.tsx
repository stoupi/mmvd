'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { updateOwnProfileAction } from '@/lib/actions/profile-actions';
import { updateOwnProfileSchema } from '@/lib/schemas/profile';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type ProfileFormData = z.infer<typeof updateOwnProfileSchema>;

interface ProfileFormProps {
  centreCode: string;
  centreName: string;
  affiliation: string;
}

export function ProfileForm({ centreCode, centreName, affiliation }: ProfileFormProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(updateOwnProfileSchema),
    defaultValues: {
      centreCode,
      centreName,
      affiliation: affiliation || ''
    }
  });

  const { execute, status } = useAction(updateOwnProfileAction, {
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update profile');
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    execute(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div className='grid grid-cols-[120px_1fr] gap-4'>
          <FormField
            control={form.control}
            name='centreCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Centre Code *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='001' maxLength={3} />
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
                <FormLabel>Centre Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Paris Centre' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='affiliation'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Affiliation</FormLabel>
              <FormControl>
                <Input {...field} placeholder='University Hospital' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end'>
          <Button type='submit' disabled={status === 'executing'}>
            {status === 'executing' ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
