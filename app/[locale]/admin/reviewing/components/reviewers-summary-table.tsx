'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TopicBadge } from '@/components/design-system/topic-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { sendEmailToReviewerAction } from '@/lib/actions/reviewing-actions';
import { toast } from 'sonner';
import { useRouter } from '@/app/i18n/navigation';
import { cn } from '@/lib/utils';

interface ReviewerSummary {
  reviewer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    centre: {
      code: string;
    } | null;
    reviewTopics: Array<{
      id: string;
      label: string;
      color: string | null;
    }>;
  };
  proposalCount: number;
  draftCount: number;
  validatedCount: number;
  lastEmailSentAt: Date | null;
  reviews: Array<{
    id: string;
    proposalId: string;
    isDraft: boolean;
    emailSentAt: Date | null;
    deadline: Date;
    proposal: {
      id: string;
      title: string;
      piUser: {
        firstName: string | null;
        lastName: string | null;
        email: string;
      };
      mainArea: {
        code: string | null;
        label: string;
        color: string | null;
      };
      centre: {
        code: string;
      } | null;
    };
  }>;
}

interface ReviewersSummaryTableProps {
  reviewersSummary: ReviewerSummary[];
  windowId: string;
}

function getReviewerName(reviewer: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  if (reviewer.firstName && reviewer.lastName) {
    return `${reviewer.firstName} ${reviewer.lastName}`;
  }
  return reviewer.email;
}

function formatDateTime(date: Date | null): string {
  if (!date) return 'Never';
  const now = new Date();
  const emailDate = new Date(date);
  const diffMs = now.getTime() - emailDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return emailDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function ReviewersSummaryTable({
  reviewersSummary,
  windowId
}: ReviewersSummaryTableProps) {
  const router = useRouter();
  const [selectedReviewer, setSelectedReviewer] = useState<ReviewerSummary | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [expandedReviewers, setExpandedReviewers] = useState<Set<string>>(new Set());

  const { execute: sendEmail, status } = useAction(sendEmailToReviewerAction, {
    onSuccess: ({ data }) => {
      toast.success(`Successfully sent email to ${selectedReviewer?.reviewer.email}`);
      router.refresh();
      setShowConfirmDialog(false);
      setSelectedReviewer(null);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to send email');
    }
  });

  const handleSendEmail = (reviewer: ReviewerSummary) => {
    setSelectedReviewer(reviewer);
    setShowConfirmDialog(true);
  };

  const confirmSendEmail = () => {
    if (selectedReviewer) {
      sendEmail({
        reviewerId: selectedReviewer.reviewer.id,
        windowId
      });
    }
  };

  const toggleExpand = (reviewerId: string) => {
    const newExpanded = new Set(expandedReviewers);
    if (newExpanded.has(reviewerId)) {
      newExpanded.delete(reviewerId);
    } else {
      newExpanded.add(reviewerId);
    }
    setExpandedReviewers(newExpanded);
  };

  const getPiName = (piUser: { firstName: string | null; lastName: string | null; email: string }) => {
    if (piUser.firstName && piUser.lastName) {
      return `${piUser.firstName} ${piUser.lastName}`;
    }
    return piUser.email;
  };

  return (
    <>
      <div className='rounded-md border bg-white overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[50px]'></TableHead>
              <TableHead className='w-[200px]'>Reviewer</TableHead>
              <TableHead className='w-[100px]'>Centre</TableHead>
              <TableHead className='w-[150px]'>Main Topics</TableHead>
              <TableHead className='w-[150px]'>Email</TableHead>
              <TableHead className='w-[120px] text-center'>Proposals</TableHead>
              <TableHead className='w-[150px] text-center'>Status</TableHead>
              <TableHead className='w-[150px]'>Last Email Sent</TableHead>
              <TableHead className='w-[120px] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewersSummary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center py-8 text-muted-foreground'>
                  No reviewers assigned yet
                </TableCell>
              </TableRow>
            ) : (
              reviewersSummary.map((summary) => {
                const isExpanded = expandedReviewers.has(summary.reviewer.id);
                return (
                  <React.Fragment key={summary.reviewer.id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => toggleExpand(summary.reviewer.id)}
                          className='p-0 h-8 w-8'
                        >
                          {isExpanded ? (
                            <ChevronDown className='h-4 w-4' />
                          ) : (
                            <ChevronRight className='h-4 w-4' />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className='font-medium'>
                        {getReviewerName(summary.reviewer)}
                      </TableCell>
                      <TableCell>
                        <span className='text-sm text-muted-foreground'>
                          {summary.reviewer.centre?.code || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {summary.reviewer.reviewTopics.length > 0 ? (
                            summary.reviewer.reviewTopics.map((topic) => (
                              <Badge
                                key={topic.id}
                                style={{
                                  backgroundColor: topic.color || '#6b7280'
                                }}
                                className='text-xs'
                              >
                                {topic.label}
                              </Badge>
                            ))
                          ) : (
                            <span className='text-sm text-muted-foreground'>-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-[150px] truncate text-sm text-muted-foreground'>
                          {summary.reviewer.email}
                        </div>
                      </TableCell>
                      <TableCell className='text-center font-semibold'>
                        {summary.proposalCount}
                      </TableCell>
                      <TableCell className='text-center'>
                        <div className='flex justify-center gap-2'>
                          {summary.draftCount > 0 && (
                            <Badge
                              variant='outline'
                              className='bg-yellow-50 text-yellow-700 border-yellow-200'
                            >
                              {summary.draftCount}D
                            </Badge>
                          )}
                          {summary.validatedCount > 0 && (
                            <Badge
                              variant='outline'
                              className='bg-green-50 text-green-700 border-green-200'
                            >
                              {summary.validatedCount}V
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {formatDateTime(summary.lastEmailSentAt)}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => handleSendEmail(summary)}
                          disabled={status === 'executing'}
                        >
                          <Mail className='h-4 w-4 mr-1' />
                          {summary.lastEmailSentAt ? 'Resend' : 'Send'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={9} className='bg-muted/50 p-0'>
                          <div className='py-2 px-4'>
                            <div className='space-y-1'>
                              {summary.reviews.map((review) => (
                                <div
                                  key={review.id}
                                  className='flex items-center gap-2 text-sm py-1'
                                >
                                  {review.isDraft && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs bg-yellow-50 border-yellow-200'
                                    >
                                      Draft
                                    </Badge>
                                  )}
                                  <span className='text-muted-foreground'>
                                    {review.proposal.centre?.code || 'N/A'}
                                  </span>
                                  <span>•</span>
                                  <span className='text-muted-foreground'>
                                    {getPiName(review.proposal.piUser)}
                                  </span>
                                  <span>•</span>
                                  <span className='flex-1'>{review.proposal.title}</span>
                                  <TopicBadge topic={review.proposal.mainArea} className='text-xs' />
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Email to Reviewer?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedReviewer && (
                <>
                  Send assignment notification email to{' '}
                  <strong>{getReviewerName(selectedReviewer.reviewer)}</strong> for{' '}
                  <strong>{selectedReviewer.proposalCount}</strong> proposal
                  {selectedReviewer.proposalCount > 1 ? 's' : ''}?
                  {selectedReviewer.lastEmailSentAt && (
                    <span className='block mt-2 text-sm'>
                      Last sent: {formatDateTime(selectedReviewer.lastEmailSentAt)}
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendEmail} disabled={status === 'executing'}>
              {status === 'executing' ? 'Sending...' : 'Confirm & Send'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
