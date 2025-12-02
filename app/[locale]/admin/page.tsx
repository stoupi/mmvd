import { requirePermissionGuard } from '@/lib/auth-guard';
import { getAllProposals } from '@/lib/services/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { ProposalsTable } from './proposals/components/proposals-table';

export default async function AdminDashboardPage() {
  await requirePermissionGuard('ADMIN');

  const proposals = await getAllProposals();

  return (
    <div className='p-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Abstracts</h1>
        <p className='text-muted-foreground'>
          View and manage all submitted abstracts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Abstracts ({proposals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className='text-center py-12'>
              <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No abstracts yet</h3>
              <p className='text-sm text-muted-foreground'>
                Abstracts will appear here once they are submitted
              </p>
            </div>
          ) : (
            <ProposalsTable proposals={proposals} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
