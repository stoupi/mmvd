import { requirePermissionGuard } from '@/lib/auth-guard';
import { getAllProposals, getAllSubmissionWindows } from '@/lib/services/admin';
import { getEligibleReviewers } from '@/lib/services/reviewing';
import { ClipboardCheck } from 'lucide-react';
import { ReviewingView } from './components/reviewing-view';

export default async function AdminReviewingPage() {
  await requirePermissionGuard('ADMIN');

  const [proposals, windows, reviewers] = await Promise.all([
    getAllProposals(),
    getAllSubmissionWindows(),
    getEligibleReviewers()
  ]);

  // Filter to show only SUBMITTED proposals
  const submittedProposals = proposals.filter((proposal) => proposal.status === 'SUBMITTED');

  const windowsForFilter = windows.map((window) => ({
    id: window.id,
    name: window.name
  }));

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Reviewer Assignment</h1>
        <p className='text-muted-foreground'>
          Assign reviewers to submitted proposals
        </p>
      </div>

      {submittedProposals.length === 0 ? (
        <div className='text-center py-12'>
          <ClipboardCheck className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No submitted proposals</h3>
          <p className='text-sm text-muted-foreground'>
            Proposals will appear here once they are submitted
          </p>
        </div>
      ) : (
        <ReviewingView
          proposals={submittedProposals}
          windows={windowsForFilter}
          reviewers={reviewers}
        />
      )}
    </div>
  );
}
