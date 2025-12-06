import { requirePermissionGuard } from '@/lib/auth-guard';
import { getWindowReviewingData, getReviewersSummaryForWindow } from '@/lib/services/reviewing';
import { getEligibleReviewers } from '@/lib/services/reviewing';
import { notFound } from 'next/navigation';
import { WindowReviewingView } from '../components/window-reviewing-view';

interface PageProps {
  params: Promise<{
    windowId: string;
  }>;
}

export default async function WindowReviewingPage({ params }: PageProps) {
  await requirePermissionGuard('ADMIN');

  const { windowId } = await params;

  const [window, reviewersSummary, eligibleReviewers] = await Promise.all([
    getWindowReviewingData(windowId),
    getReviewersSummaryForWindow(windowId),
    getEligibleReviewers()
  ]);

  if (!window) {
    notFound();
  }

  return (
    <div className='p-8'>
      <WindowReviewingView
        window={window}
        reviewersSummary={reviewersSummary}
        eligibleReviewers={eligibleReviewers}
      />
    </div>
  );
}
