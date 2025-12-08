'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { ReviewDecision } from '@/app/generated/prisma';

interface ReviewFormProps {
  reviewId: string;
  isCompleted: boolean;
}

export function ReviewForm({ reviewId, isCompleted }: ReviewFormProps) {
  const router = useRouter();

  // Quick questions state
  const [aimClear, setAimClear] = useState<boolean | null>(null);
  const [aimOriginal, setAimOriginal] = useState<boolean | null>(null);
  const [feasible, setFeasible] = useState<boolean | null>(null);
  const [rationaleWell, setRationaleWell] = useState<boolean | null>(null);
  const [literatureReviewed, setLiteratureReviewed] = useState<boolean | null>(null);
  const [exposureDefined, setExposureDefined] = useState<boolean | null>(null);
  const [endpointIdentified, setEndpointIdentified] = useState<boolean | null>(null);
  const [endpointMeaningful, setEndpointMeaningful] = useState<boolean | null>(null);
  const [statisticalPlanCoherent, setStatisticalPlanCoherent] = useState<boolean | null>(null);
  const [wellWritten, setWellWritten] = useState<boolean | null>(null);

  // Detailed comments state
  const [generalComments, setGeneralComments] = useState('');
  const [statisticalComments, setStatisticalComments] = useState('');
  const [modificationsRequired, setModificationsRequired] = useState('');

  // Decision state
  const [decision, setDecision] = useState<ReviewDecision | ''>('');

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
    saveDraft({
      reviewId,
      aimClear: aimClear ?? undefined,
      aimOriginal: aimOriginal ?? undefined,
      feasible: feasible ?? undefined,
      rationaleWell: rationaleWell ?? undefined,
      literatureReviewed: literatureReviewed ?? undefined,
      exposureDefined: exposureDefined ?? undefined,
      endpointIdentified: endpointIdentified ?? undefined,
      endpointMeaningful: endpointMeaningful ?? undefined,
      statisticalPlanCoherent: statisticalPlanCoherent ?? undefined,
      wellWritten: wellWritten ?? undefined,
      generalComments: generalComments || undefined,
      statisticalComments: statisticalComments || undefined,
      modificationsRequired: modificationsRequired || undefined,
      decision: decision || undefined
    });
  };

  const handleSubmitClick = () => {
    // Validation
    const allQuestionsAnswered =
      aimClear !== null &&
      aimOriginal !== null &&
      feasible !== null &&
      rationaleWell !== null &&
      literatureReviewed !== null &&
      exposureDefined !== null &&
      endpointIdentified !== null &&
      endpointMeaningful !== null &&
      statisticalPlanCoherent !== null &&
      wellWritten !== null;

    if (!allQuestionsAnswered) {
      toast.error('Please answer all questions');
      return;
    }

    if (!generalComments.trim()) {
      toast.error('Please provide general comments');
      return;
    }

    if (!statisticalComments.trim()) {
      toast.error('Please provide specific comments on the statistical analysis section');
      return;
    }

    if (!modificationsRequired.trim()) {
      toast.error('Please provide modifications required for resubmission');
      return;
    }

    if (!decision) {
      toast.error('Please select a decision');
      return;
    }

    setShowSubmitDialog(true);
  };

  const handleConfirmSubmit = () => {
    submitReview({
      reviewId,
      aimClear: aimClear!,
      aimOriginal: aimOriginal!,
      feasible: feasible!,
      rationaleWell: rationaleWell!,
      literatureReviewed: literatureReviewed!,
      exposureDefined: exposureDefined!,
      endpointIdentified: endpointIdentified!,
      endpointMeaningful: endpointMeaningful!,
      statisticalPlanCoherent: statisticalPlanCoherent!,
      wellWritten: wellWritten!,
      generalComments,
      statisticalComments,
      modificationsRequired,
      decision: decision as ReviewDecision
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

  const QuestionCheckbox = ({
    label,
    checked,
    onCheckedChange
  }: {
    label: string;
    checked: boolean | null;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <div className='flex items-start gap-4 py-3 border-b'>
      <div className='flex-1'>
        <Label className='font-normal cursor-pointer'>{label}</Label>
      </div>
      <div className='flex gap-4'>
        <label className='flex items-center gap-2 cursor-pointer'>
          <Checkbox checked={checked === true} onCheckedChange={() => onCheckedChange(true)} />
          <span className='text-sm'>Yes</span>
        </label>
        <label className='flex items-center gap-2 cursor-pointer'>
          <Checkbox checked={checked === false} onCheckedChange={() => onCheckedChange(false)} />
          <span className='text-sm'>No</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      <Card className='border-blue-200 bg-blue-50'>
        <CardHeader className='bg-blue-100 border-b-0'>
          <CardTitle className='text-blue-900 text-2xl'>Submit Your Review</CardTitle>
        </CardHeader>
        <CardContent className='space-y-8 pt-4'>
          {/* Questions */}
          <div className='space-y-3'>
            <div className='space-y-1'>
              <QuestionCheckbox
                label='Is the aim of the study clearly and precisely formulated?'
                checked={aimClear}
                onCheckedChange={setAimClear}
              />
              <QuestionCheckbox
                label='Is the aim of the study original and clinically relevant?'
                checked={aimOriginal}
                onCheckedChange={setAimOriginal}
              />
              <QuestionCheckbox
                label='Is the proposed ancillary study feasible in terms of available variables and expected sample size based on the inclusion criteria?'
                checked={feasible}
                onCheckedChange={setFeasible}
              />
              <QuestionCheckbox
                label='Is the rationale of the study well-articulated and scientifically justified?'
                checked={rationaleWell}
                onCheckedChange={setRationaleWell}
              />
              <QuestionCheckbox
                label='Is the background literature adequately reviewed and appropriately referenced?'
                checked={literatureReviewed}
                onCheckedChange={setLiteratureReviewed}
              />
              <QuestionCheckbox
                label='Is the exposure variable clearly defined?'
                checked={exposureDefined}
                onCheckedChange={setExposureDefined}
              />
              <QuestionCheckbox
                label='Is the primary endpoint clearly identified?'
                checked={endpointIdentified}
                onCheckedChange={setEndpointIdentified}
              />
              <QuestionCheckbox
                label='Is the primary endpoint clinically meaningful and appropriate for the aim of this study?'
                checked={endpointMeaningful}
                onCheckedChange={setEndpointMeaningful}
              />
              <QuestionCheckbox
                label='Is the proposed statistical analysis plan coherent and aligned with the study objectives?'
                checked={statisticalPlanCoherent}
                onCheckedChange={setStatisticalPlanCoherent}
              />
              <QuestionCheckbox
                label='The manuscript is reasonably well-written in English (no significant grammatical, syntactical, or spelling errors)?'
                checked={wellWritten}
                onCheckedChange={setWellWritten}
              />
            </div>
          </div>

          {/* Comments */}
          <div className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='generalComments'>General comments on the proposal (limit 1500 words) *</Label>
              <Textarea
                id='generalComments'
                placeholder='Enter your general comments...'
                value={generalComments}
                onChange={(e) => setGeneralComments(e.target.value)}
                rows={8}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='statisticalComments'>
                Specific comments on the statistical analysis section (limit 1000 words) *
              </Label>
              <Textarea
                id='statisticalComments'
                placeholder='Enter your statistical analysis comments...'
                value={statisticalComments}
                onChange={(e) => setStatisticalComments(e.target.value)}
                rows={6}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='modificationsRequired'>Modifications required for resubmission (limit 1000 words) *</Label>
              <Textarea
                id='modificationsRequired'
                placeholder='Enter required modifications...'
                value={modificationsRequired}
                onChange={(e) => setModificationsRequired(e.target.value)}
                rows={6}
              />
            </div>
          </div>

          {/* Decision */}
          <div className='space-y-3'>
            <Label>Decision *</Label>
            <RadioGroup value={decision} onValueChange={(value) => setDecision(value as ReviewDecision)}>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='ACCEPT' id='accept' />
                <Label htmlFor='accept' className='font-normal cursor-pointer'>
                  Accepted
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='REVISE' id='revise' />
                <Label htmlFor='revise' className='font-normal cursor-pointer'>
                  Revision
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='REJECT' id='reject' />
                <Label htmlFor='reject' className='font-normal cursor-pointer'>
                  Rejected
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className='flex gap-3 pt-4 border-t'>
            <Button onClick={handleSubmitClick} disabled={isExecuting} className='flex-1'>
              <Send className='h-4 w-4 mr-2' />
              Submit Review
            </Button>

            <Button onClick={handleSaveDraft} disabled={isExecuting} variant='outline' className='flex-1'>
              <Save className='h-4 w-4 mr-2' />
              Save as Draft
            </Button>

            <Button onClick={handleCancel} disabled={isExecuting} variant='ghost'>
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
            <AlertDialogTitle className='text-2xl text-gray-900'>Confirmation of review submission</AlertDialogTitle>
            <div className='text-gray-900 space-y-4 pt-2'>
              <div className='font-semibold text-base'>Are you sure you want to submit this review?</div>
              <div>
                <div className='text-sm mb-2'>Once submitted:</div>
                <ul className='text-sm space-y-1 list-disc list-inside pl-2'>
                  <li>
                    You <strong>cannot modify</strong> this review
                  </li>
                  <li>
                    Your feedback will be <strong>shared with the admin</strong>
                  </li>
                  <li>
                    This action is <strong className='text-pink-600'>final and irreversible</strong>
                  </li>
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
