'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useRouter } from '@/app/i18n/navigation';
import { Save, Send, X } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { saveReviewDraftAction, submitReviewAction } from '@/lib/actions/review-actions';
import { toast } from 'sonner';
import type { ReviewDecision, OverlapAssessment } from '@/app/generated/prisma';

interface ReviewFormProps {
  reviewId: string;
  isCompleted: boolean;
}

export function ReviewForm({ reviewId, isCompleted }: ReviewFormProps) {
  const router = useRouter();
  const [decision, setDecision] = useState<ReviewDecision | ''>('');
  const [overlap, setOverlap] = useState<OverlapAssessment | ''>('');
  const [overlapDetails, setOverlapDetails] = useState('');
  const [commentsForPI, setCommentsForPI] = useState('');
  const [commentsForAdmin, setCommentsForAdmin] = useState('');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const { execute: saveDraft, status: saveDraftStatus } = useAction(saveReviewDraftAction, {
    onSuccess: () => {
      toast.success('Draft saved successfully');
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to save draft');
    }
  });

  const { execute: submitReview, status: submitStatus } = useAction(submitReviewAction, {
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      router.push('/reviewing');
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to submit review');
    }
  });

  const handleSaveDraft = () => {
    if (!commentsForPI.trim()) {
      toast.error('Please add comments for PI before saving');
      return;
    }

    saveDraft({
      reviewId,
      decision: decision || undefined,
      overlap: overlap || undefined,
      overlapDetails: overlapDetails || undefined,
      commentsForPI: commentsForPI || undefined,
      commentsForAdmin: commentsForAdmin || undefined
    });
  };

  const handleSubmitClick = () => {
    if (!commentsForPI.trim()) {
      toast.error('Please add comments for PI before submitting');
      return;
    }

    if (!decision) {
      toast.error('Please select a decision');
      return;
    }

    if (!overlap) {
      toast.error('Please select an overlap assessment');
      return;
    }

    setShowSubmitDialog(true);
  };

  const handleConfirmSubmit = () => {
    submitReview({
      reviewId,
      decision: decision as ReviewDecision,
      overlap: overlap as OverlapAssessment,
      overlapDetails: overlapDetails || undefined,
      commentsForPI,
      commentsForAdmin: commentsForAdmin || undefined
    });
    setShowSubmitDialog(false);
  };

  const handleCancel = () => {
    router.push('/reviewing');
  };

  const isExecuting = saveDraftStatus === 'executing' || submitStatus === 'executing';

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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Review</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Decision */}
          <div className='space-y-3'>
            <Label>Decision *</Label>
            <RadioGroup value={decision} onValueChange={(value) => setDecision(value as ReviewDecision)}>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='ACCEPT' id='accept' />
                <Label htmlFor='accept' className='font-normal cursor-pointer'>Accept</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='REVISE' id='revise' />
                <Label htmlFor='revise' className='font-normal cursor-pointer'>Revise</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='REJECT' id='reject' />
                <Label htmlFor='reject' className='font-normal cursor-pointer'>Reject</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Overlap Assessment */}
          <div className='space-y-3'>
            <Label>Overlap Assessment *</Label>
            <RadioGroup value={overlap} onValueChange={(value) => setOverlap(value as OverlapAssessment)}>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='NO' id='no' />
                <Label htmlFor='no' className='font-normal cursor-pointer'>No overlap</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='PARTIAL' id='partial' />
                <Label htmlFor='partial' className='font-normal cursor-pointer'>Partial overlap</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='MAJOR' id='major' />
                <Label htmlFor='major' className='font-normal cursor-pointer'>Major overlap</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Overlap Details */}
          {(overlap === 'PARTIAL' || overlap === 'MAJOR') && (
            <div className='space-y-2'>
              <Label htmlFor='overlapDetails'>Overlap Details</Label>
              <Textarea
                id='overlapDetails'
                placeholder='Please describe the overlap...'
                value={overlapDetails}
                onChange={(e) => setOverlapDetails(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Comments for PI */}
          <div className='space-y-2'>
            <Label htmlFor='commentsForPI'>Comments for PI *</Label>
            <Textarea
              id='commentsForPI'
              placeholder='Enter your comments for the Principal Investigator...'
              value={commentsForPI}
              onChange={(e) => setCommentsForPI(e.target.value)}
              rows={8}
            />
            <p className='text-sm text-muted-foreground'>
              These comments will be shared with the PI
            </p>
          </div>

          {/* Comments for Admin */}
          <div className='space-y-2'>
            <Label htmlFor='commentsForAdmin'>Comments for Admin (Optional)</Label>
            <Textarea
              id='commentsForAdmin'
              placeholder='Enter confidential comments for administrators...'
              value={commentsForAdmin}
              onChange={(e) => setCommentsForAdmin(e.target.value)}
              rows={4}
            />
            <p className='text-sm text-muted-foreground'>
              These comments are confidential and will not be shared with the PI
            </p>
          </div>

          <div className='flex gap-3 pt-4 border-t'>
            <Button
              onClick={handleSubmitClick}
              disabled={isExecuting}
              className='flex-1'
            >
              <Send className='h-4 w-4 mr-2' />
              Submit Review
            </Button>

            <Button
              onClick={handleSaveDraft}
              disabled={isExecuting}
              variant='outline'
              className='flex-1'
            >
              <Save className='h-4 w-4 mr-2' />
              Save as Draft
            </Button>

            <Button
              onClick={handleCancel}
              disabled={isExecuting}
              variant='ghost'
            >
              <X className='h-4 w-4 mr-2' />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-2xl text-gray-900'>
              Confirmation of review submission
            </AlertDialogTitle>
            <div className='text-gray-900 space-y-4 pt-2'>
              <div className='font-semibold text-base'>
                Are you sure you want to submit this review?
              </div>
              <div>
                <div className='text-sm mb-2'>
                  Once submitted:
                </div>
                <ul className='text-sm space-y-1 list-disc list-inside pl-2'>
                  <li>You <strong>cannot modify</strong> this review</li>
                  <li>Your feedback will be <strong>shared with the PI</strong></li>
                  <li>This action is <strong className='text-pink-600'>final and irreversible</strong></li>
                </ul>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} disabled={isExecuting}>
              {isExecuting ? 'Submitting...' : 'Confirm Submission'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
