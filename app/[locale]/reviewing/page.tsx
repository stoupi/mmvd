import { requirePermissionGuard } from '@/lib/auth-guard';
import { getTypedSession } from '@/lib/auth-helpers';
import { getReviewerAssignedProposals } from '@/lib/services/reviewing';
import { ClipboardCheck } from 'lucide-react';
import { ReviewerProposalsTable } from './components/reviewer-proposals-table';

export default async function ReviewingDashboardPage() {
  await requirePermissionGuard('REVIEWING');
  const session = await getTypedSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  const reviews = await getReviewerAssignedProposals(session.user.id);

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>My Assigned Proposals</h1>
        <p className='text-muted-foreground'>
          Review and evaluate proposals assigned to you
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className='text-center py-12'>
          <ClipboardCheck className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No proposals assigned</h3>
          <p className='text-sm text-muted-foreground'>
            Proposals will appear here once they are assigned to you for review
          </p>
        </div>
      ) : (
        <ReviewerProposalsTable reviews={reviews} />
      )}
    </div>
  );
}
