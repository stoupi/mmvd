import { requirePermissionGuard } from '@/lib/auth-guard';
import { getWindowsWithReviewingStats } from '@/lib/services/admin';
import { WindowsListView } from '@/app/[locale]/admin/reviewing/components/windows-list-view';

export default async function AdminReviewingPage() {
  await requirePermissionGuard('ADMIN');

  const windows = await getWindowsWithReviewingStats();

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Reviewer Assignment</h1>
        <p className='text-muted-foreground'>
          Select a submission window to manage reviewer assignments
        </p>
      </div>

      <WindowsListView windows={windows} />
    </div>
  );
}
