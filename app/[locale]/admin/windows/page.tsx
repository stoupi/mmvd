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
    <div className='container mx-auto py-8 max-w-6xl'>
      <div className='flex items-start justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Submission Windows</h1>
          <p className='text-muted-foreground'>
            Manage proposal submission periods and deadlines
          </p>
        </div>
        <CreateWindowDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Submission Windows ({windows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {windows.length === 0 ? (
            <div className='text-center py-8'>
              <Calendar className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No submission windows yet</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Create your first submission window to start accepting proposals
              </p>
            </div>
          ) : (
            <WindowsList windows={windows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
