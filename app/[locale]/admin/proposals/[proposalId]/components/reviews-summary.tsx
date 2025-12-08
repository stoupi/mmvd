'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { Review, User } from '@/app/generated/prisma';

interface ReviewWithReviewer extends Review {
  reviewer: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
}

interface ReviewsSummaryProps {
  reviews: ReviewWithReviewer[];
}

export function ReviewsSummary({ reviews }: ReviewsSummaryProps) {
  const completedReviews = reviews.filter(
    (review) => review.status === 'COMPLETED' && !review.isDraft
  );

  if (completedReviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviewer Opinions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            No completed reviews yet. Reviews will appear here once reviewers submit their evaluations.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getDecisionBadge = (decision: string | null) => {
    if (!decision) return null;

    switch (decision) {
      case 'ACCEPT':
        return (
          <Badge className='bg-green-500 flex items-center gap-1'>
            <CheckCircle2 className='h-3 w-3' />
            Accepted
          </Badge>
        );
      case 'REJECT':
        return (
          <Badge className='bg-red-500 flex items-center gap-1'>
            <XCircle className='h-3 w-3' />
            Rejected
          </Badge>
        );
      case 'REVISE':
        return (
          <Badge className='bg-yellow-500 flex items-center gap-1'>
            <AlertCircle className='h-3 w-3' />
            Revision
          </Badge>
        );
      default:
        return null;
    }
  };

  const getReviewerName = (reviewer: Pick<User, 'firstName' | 'lastName' | 'email'>) => {
    if (reviewer.firstName && reviewer.lastName) {
      return `${reviewer.firstName} ${reviewer.lastName}`;
    }
    return reviewer.email;
  };

  const QuestionAnswer = ({ label, value }: { label: string; value: boolean | null }) => (
    <div className='flex items-start justify-between py-2 border-b last:border-0'>
      <span className='text-sm flex-1'>{label}</span>
      {value === null ? (
        <Badge variant='outline' className='ml-2'>N/A</Badge>
      ) : value ? (
        <Badge className='bg-green-100 text-green-800 border-green-200 ml-2'>Yes</Badge>
      ) : (
        <Badge className='bg-red-100 text-red-800 border-red-200 ml-2'>No</Badge>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviewer Opinions ({completedReviews.length})</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {completedReviews.map((review) => (
          <div key={review.id} className='border rounded-lg p-6 space-y-4'>
            {/* Reviewer Header */}
            <div className='flex items-center justify-between pb-4 border-b'>
              <div>
                <h3 className='font-semibold text-lg'>
                  {getReviewerName(review.reviewer)}
                </h3>
                <p className='text-sm text-muted-foreground'>{review.reviewer.email}</p>
                {review.completedAt && (
                  <p className='text-xs text-muted-foreground mt-1'>
                    Submitted on {new Date(review.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {getDecisionBadge(review.decision)}
            </div>

            {/* Quick Questions */}
            <div>
              <h4 className='font-semibold mb-3'>Quick Questions</h4>
              <div className='space-y-1'>
                <QuestionAnswer
                  label='Is the aim clearly and precisely formulated?'
                  value={review.aimClear}
                />
                <QuestionAnswer
                  label='Is the aim original and clinically relevant?'
                  value={review.aimOriginal}
                />
                <QuestionAnswer
                  label='Is the study feasible?'
                  value={review.feasible}
                />
                <QuestionAnswer
                  label='Is the rationale well-articulated?'
                  value={review.rationaleWell}
                />
                <QuestionAnswer
                  label='Is the literature adequately reviewed?'
                  value={review.literatureReviewed}
                />
                <QuestionAnswer
                  label='Is the exposure variable clearly defined?'
                  value={review.exposureDefined}
                />
                <QuestionAnswer
                  label='Is the primary endpoint clearly identified?'
                  value={review.endpointIdentified}
                />
                <QuestionAnswer
                  label='Is the primary endpoint clinically meaningful?'
                  value={review.endpointMeaningful}
                />
                <QuestionAnswer
                  label='Is the statistical analysis plan coherent?'
                  value={review.statisticalPlanCoherent}
                />
                <QuestionAnswer
                  label='Is the manuscript reasonably well-written?'
                  value={review.wellWritten}
                />
              </div>
            </div>

            {/* Detailed Comments */}
            {review.generalComments && (
              <div>
                <h4 className='font-semibold mb-2'>General Comments</h4>
                <div className='bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap'>
                  {review.generalComments}
                </div>
              </div>
            )}

            {review.statisticalComments && (
              <div>
                <h4 className='font-semibold mb-2'>Statistical Analysis Comments</h4>
                <div className='bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap'>
                  {review.statisticalComments}
                </div>
              </div>
            )}

            {review.modificationsRequired && (
              <div>
                <h4 className='font-semibold mb-2'>Modifications Required for Resubmission</h4>
                <div className='bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap'>
                  {review.modificationsRequired}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
