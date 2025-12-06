import { requirePermissionGuard } from '@/lib/auth-guard';
import { getTypedSession } from '@/lib/auth-helpers';
import { getReviewById } from '@/lib/services/reviewing';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { ReviewForm } from './components/review-form';
import { ProposalDetailsView } from './components/proposal-details-view';

export default async function ReviewProposalPage({
  params
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  await requirePermissionGuard('REVIEWING');

  const session = await getTypedSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Find the review for this proposal and current user
  const reviews = await import('@/lib/services/reviewing').then((m) =>
    m.getReviewerAssignedProposals(session.user.id)
  );

  const review = reviews.find((r) => r.proposal.id === proposalId);

  if (!review) {
    notFound();
  }

  const isCompleted = review.status === 'COMPLETED';

  return (
    <div className='container mx-auto py-8 max-w-5xl'>
      <Link href='/reviewing'>
        <Button variant='ghost' size='sm' className='mb-4'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Dashboard
        </Button>
      </Link>

      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>
          {isCompleted ? 'Review Submitted' : 'Submit Review'}
        </h1>
        <p className='text-muted-foreground'>
          {isCompleted
            ? 'You have already submitted your review for this proposal'
            : 'Evaluate the proposal and provide your feedback'}
        </p>
      </div>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Proposal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProposalDetailsView proposal={review.proposal} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isCompleted ? 'Your Review' : 'Submit Your Review'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm review={review} readOnly={isCompleted} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
