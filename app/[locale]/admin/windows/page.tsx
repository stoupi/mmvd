import { requirePermissionGuard } from '@/lib/auth-guard';
import { getAllSubmissionWindows } from '@/lib/services/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { CreateWindowDialog } from './components/create-window-dialog';
import { WindowsList } from './components/windows-list';

export default async function SubmissionWindowsPage() {
  await requirePermissionGuard('ADMIN');

  const windows = await getAllSubmissionWindows();

  return (
    <div className='p-8'>
      <div className='flex items-start justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Submission Windows</h1>
          <p className='text-muted-foreground'>
            Manage proposal submission periods and deadlines
          </p>
        </div>
        <CreateWindowDialog />
      </div>

      {windows.length === 0 ? (
        <Card>
          <CardContent className='py-12'>
            <div className='text-center'>
              <Calendar className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No submission windows yet</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Create your first submission window to start accepting proposals
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <WindowsList windows={windows} />
      )}
    </div>
  );
}
