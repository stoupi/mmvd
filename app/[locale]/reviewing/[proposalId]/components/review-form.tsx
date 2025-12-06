'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAction } from 'next-safe-action/hooks';
import { submitReviewAction } from '@/lib/actions/reviewing-actions';
import { toast } from 'sonner';
import { useRouter } from '@/app/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Review {
  id: string;
  deadline: Date;
  status: string;
  decision: string | null;
  overlap: string | null;
  overlapDetails: string | null;
  commentsForPI: string | null;
  commentsForAdmin: string | null;
}

interface ReviewFormProps {
  review: Review;
  readOnly: boolean;
}

const formSchema = z.object({
  decision: z.enum(['ACCEPT', 'REJECT', 'REVISE'], {
    required_error: 'Please select a decision'
  }),
  overlap: z.enum(['NO', 'PARTIAL', 'MAJOR'], {
    required_error: 'Please select an overlap assessment'
  }),
  overlapDetails: z.string().optional(),
  commentsForPI: z.string().optional(),
  commentsForAdmin: z.string().optional()
}).refine(
  (data) => {
    if (data.overlap === 'PARTIAL' || data.overlap === 'MAJOR') {
      return data.overlapDetails && data.overlapDetails.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Overlap details are required when overlap is Partial or Major',
    path: ['overlapDetails']
  }
);

type FormValues = z.infer<typeof formSchema>;

export function ReviewForm({ review, readOnly }: ReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      decision: (review.decision as FormValues['decision']) || undefined,
      overlap: (review.overlap as FormValues['overlap']) || undefined,
      overlapDetails: review.overlapDetails || '',
      commentsForPI: review.commentsForPI || '',
      commentsForAdmin: review.commentsForAdmin || ''
    }
  });

  const { execute: submitReview } = useAction(submitReviewAction, {
    onSuccess: () => {
      toast.success('Review submitted successfully');
      router.push('/reviewing');
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to submit review');
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    submitReview({
      reviewId: review.id,
      ...data
    });
  };

  const overlapValue = form.watch('overlap');

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between p-4 bg-muted rounded-md'>
        <div>
          <p className='text-sm text-muted-foreground'>Review Deadline</p>
          <p className='font-medium'>{format(new Date(review.deadline), 'PPP')}</p>
        </div>
        {review.status === 'COMPLETED' && (
          <Badge className='bg-green-600'>Review Completed</Badge>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='decision'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-base font-semibold'>
                  Decision <span className='text-red-600'>*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={readOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select your decision' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='ACCEPT'>Accept</SelectItem>
                    <SelectItem value='REVISE'>Revise</SelectItem>
                    <SelectItem value='REJECT'>Reject</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Your recommendation for this proposal
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='overlap'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-base font-semibold'>
                  Overlap Assessment <span className='text-red-600'>*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={readOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select overlap level' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='NO'>No Overlap</SelectItem>
                    <SelectItem value='PARTIAL'>Partial Overlap</SelectItem>
                    <SelectItem value='MAJOR'>Major Overlap</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Assess if this proposal overlaps with existing work
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {(overlapValue === 'PARTIAL' || overlapValue === 'MAJOR') && (
            <FormField
              control={form.control}
              name='overlapDetails'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-base font-semibold'>
                    Overlap Details <span className='text-red-600'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Please describe the overlap in detail...'
                      className='min-h-[100px]'
                      disabled={readOnly}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Required when overlap is Partial or Major
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name='commentsForPI'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-base font-semibold'>Comments for PI (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Feedback that will be shared with the Principal Investigator...'
                    className='min-h-[120px]'
                    disabled={readOnly}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  These comments will be visible to the Principal Investigator
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='commentsForAdmin'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-base font-semibold'>
                  Comments for Admin (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Confidential comments for the admin team...'
                    className='min-h-[120px]'
                    disabled={readOnly}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  These comments are only visible to administrators
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {!readOnly && (
            <div className='flex justify-end gap-4 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/reviewing')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
