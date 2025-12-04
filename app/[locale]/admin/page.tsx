import { requirePermissionGuard } from '@/lib/auth-guard';
import { getAllProposals, getAllMainAreas, getAllSubmissionWindows } from '@/lib/services/admin';
import { FileText } from 'lucide-react';
import { ProposalsView } from './proposals/components/proposals-view';

export default async function AdminDashboardPage() {
  await requirePermissionGuard('ADMIN');

  const [proposals, mainAreas, windows] = await Promise.all([
    getAllProposals(),
    getAllMainAreas(),
    getAllSubmissionWindows()
  ]);

  const mainAreasForFilter = mainAreas.map((area) => ({
    id: area.id,
    label: area.label
  }));

  const windowsForFilter = windows.map((window) => ({
    id: window.id,
    name: window.name
  }));

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Submitted Proposals</h1>
        <p className='text-muted-foreground'>
          View and manage all submitted proposals
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className='text-center py-12'>
          <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No proposals yet</h3>
          <p className='text-sm text-muted-foreground'>
            Proposals will appear here once they are submitted
          </p>
        </div>
      ) : (
        <ProposalsView
          proposals={proposals}
          mainAreas={mainAreasForFilter}
          windows={windowsForFilter}
        />
      )}
    </div>
  );
}
