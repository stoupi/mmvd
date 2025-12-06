'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { X, CheckCircle2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { createDraftAssignmentAction, removeDraftAssignmentAction } from '@/lib/actions/reviewing-actions';
import { toast } from 'sonner';
import { useRouter } from '@/app/i18n/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Proposal {
  id: string;
  title: string;
  mainArea: {
    id: string;
    label: string;
  };
  reviews: Array<{
    id: string;
    isDraft: boolean;
    deadline: Date;
    reviewer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  }>;
}

interface Reviewer {
  id: string;
  name: string;
  email: string;
  assignmentCount: number;
  hasTopicMatch: boolean;
}

interface AssignReviewersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal;
  reviewers: Reviewer[];
}

export function AssignReviewersDialog({
  open,
  onOpenChange,
  proposal,
  reviewers
}: AssignReviewersDialogProps) {
  const router = useRouter();
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Default: 14 days from now
  );

  const { execute: assignReviewer, status } = useAction(createDraftAssignmentAction, {
    onSuccess: () => {
      toast.success('Reviewer assigned successfully');
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to assign reviewer');
    }
  });

  const { execute: removeReviewer } = useAction(removeDraftAssignmentAction, {
    onSuccess: () => {
      toast.success('Reviewer removed successfully');
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to remove reviewer');
    }
  });

  // Get existing reviews
  const existingReviews = proposal.reviews;
  const totalReviewers = existingReviews.length + selectedReviewers.length;

  const getReviewerName = (reviewer: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  }) => {
    if (reviewer.firstName && reviewer.lastName) {
      return `${reviewer.firstName} ${reviewer.lastName}`;
    }
    return reviewer.email;
  };

  // Sort reviewers by topic match and then alphabetically
  const sortedReviewers = [...reviewers].sort((a, b) => {
    const aMatches = a.hasTopicMatch;
    const bMatches = b.hasTopicMatch;

    if (aMatches && !bMatches) return -1;
    if (!aMatches && bMatches) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleAddReviewer = (reviewerId: string) => {
    if (totalReviewers >= 3) {
      toast.error('Maximum of 3 reviewers per proposal');
      return;
    }
    if (selectedReviewers.includes(reviewerId)) {
      toast.error('Reviewer already assigned');
      return;
    }
    if (existingReviews.some((r) => r.reviewer.id === reviewerId)) {
      toast.error('Reviewer already assigned');
      return;
    }

    // Call the action to create draft assignment
    assignReviewer({
      proposalId: proposal.id,
      reviewerId,
      deadline
    });

    setSelectedReviewers([...selectedReviewers, reviewerId]);
  };

  const handleRemoveNewReviewer = (reviewerId: string) => {
    setSelectedReviewers(selectedReviewers.filter((id) => id !== reviewerId));
  };

  const handleRemoveExistingReviewer = (reviewId: string) => {
    removeReviewer({ reviewId });
  };

  const handleClose = () => {
    setSelectedReviewers([]);
    setDeadline(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Assign Reviewers</DialogTitle>
          <DialogDescription>
            Assign 1-3 reviewers to evaluate this proposal. Changes are saved as drafts until you
            validate and send emails.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Proposal</Label>
            <div className='p-3 bg-muted rounded-md'>
              <p className='font-medium'>{proposal.title}</p>
              <p className='text-sm text-muted-foreground mt-1'>
                Main Topic: {proposal.mainArea.label}
              </p>
            </div>
          </div>

          {/* Existing Reviewers */}
          {existingReviews.length > 0 && (
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Existing Reviewers</Label>
              <div className='space-y-2'>
                {existingReviews.map((review) => {
                  const reviewerData = reviewers.find((r) => r.id === review.reviewer.id);
                  return (
                    <div
                      key={review.id}
                      className='flex items-center justify-between p-2 bg-blue-50 rounded-md border border-blue-200'
                    >
                      <div className='flex items-center gap-2 flex-1'>
                        <CheckCircle2 className='h-4 w-4 text-blue-600' />
                        <div className='flex-1'>
                          <span className='text-sm font-medium'>
                            {getReviewerName(review.reviewer)}
                          </span>
                          <div className='flex items-center gap-2 mt-1'>
                            {review.isDraft ? (
                              <Badge variant='outline' className='text-xs bg-yellow-50'>
                                Draft
                              </Badge>
                            ) : (
                              <Badge variant='outline' className='text-xs bg-green-50'>
                                Validated
                              </Badge>
                            )}
                            {reviewerData?.hasTopicMatch && (
                              <span className='text-xs text-green-600'>(Topic Match)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleRemoveExistingReviewer(review.id)}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Newly Added Reviewers */}
          {selectedReviewers.length > 0 && (
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Newly Added Reviewers</Label>
              <div className='space-y-2'>
                {selectedReviewers.map((reviewerId) => {
                  const reviewer = reviewers.find((r) => r.id === reviewerId);
                  if (!reviewer) return null;
                  return (
                    <div
                      key={reviewerId}
                      className='flex items-center justify-between p-2 bg-muted rounded-md'
                    >
                      <div className='flex items-center gap-2'>
                        <CheckCircle2 className='h-4 w-4 text-green-600' />
                        <span className='text-sm font-medium'>{reviewer.name}</span>
                        {reviewer.hasTopicMatch && (
                          <span className='text-xs text-green-600'>(Topic Match)</span>
                        )}
                      </div>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleRemoveNewReviewer(reviewerId)}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Add Reviewer ({totalReviewers}/3)</Label>
            <Select onValueChange={handleAddReviewer} disabled={status === 'executing'}>
              <SelectTrigger>
                <SelectValue placeholder='Select a reviewer to assign...' />
              </SelectTrigger>
              <SelectContent>
                {sortedReviewers.map((reviewer) => {
                  const isNewlyAssigned = selectedReviewers.includes(reviewer.id);
                  const isExistingAssigned = existingReviews.some((r) => r.reviewer.id === reviewer.id);
                  const isAssigned = isNewlyAssigned || isExistingAssigned;
                  return (
                    <SelectItem
                      key={reviewer.id}
                      value={reviewer.id}
                      disabled={isAssigned}
                    >
                      <div className='flex items-center justify-between w-full'>
                        <span>
                          {reviewer.hasTopicMatch && '✓ '}
                          {reviewer.name}
                        </span>
                        <span className='text-xs text-muted-foreground ml-2'>
                          ({reviewer.assignmentCount} assigned)
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              ✓ Reviewers with matching topic are shown first
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
