'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from '@/app/i18n/navigation';
import { Save, Send, X } from 'lucide-react';

interface ReviewFormProps {
  reviewId: string;
  isCompleted: boolean;
}

export function ReviewForm({ reviewId, isCompleted }: ReviewFormProps) {
  const router = useRouter();
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // TODO: Implement submit review action
    console.log('Submit review:', { reviewId, comments });
    setIsSubmitting(false);
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    // TODO: Implement save draft action
    console.log('Save draft:', { reviewId, comments });
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    router.push('/reviewing');
  };

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-4'>
            <p className='text-sm text-green-800'>
              You have completed this review. Thank you for your feedback!
            </p>
          </div>
          <Button onClick={handleCancel} variant='outline'>
            Back to Proposals
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Review</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='comments'>Comments and Feedback</Label>
          <Textarea
            id='comments'
            placeholder='Enter your review comments here...'
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={10}
            className='resize-none'
          />
          <p className='text-sm text-muted-foreground'>
            Provide your detailed feedback on the proposal
          </p>
        </div>

        <div className='flex gap-3 pt-4 border-t'>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !comments.trim()}
            className='flex-1'
          >
            <Send className='h-4 w-4 mr-2' />
            Submit Review
          </Button>

          <Button
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            variant='outline'
            className='flex-1'
          >
            <Save className='h-4 w-4 mr-2' />
            Save as Draft
          </Button>

          <Button
            onClick={handleCancel}
            disabled={isSubmitting}
            variant='ghost'
          >
            <X className='h-4 w-4 mr-2' />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
