import { requirePermissionGuard } from '@/lib/auth-guard';
import { getAllProposals } from '@/lib/services/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { ProposalsTable } from './components/proposals-table';

export default async function AdminProposalsPage() {
  await requirePermissionGuard('ADMIN');

  const proposals = await getAllProposals();

  return (
    <div className='container mx-auto py-8 max-w-7xl'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>All Proposals</h1>
        <p className='text-muted-foreground'>
          View and manage all proposals submitted across all windows
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Proposals ({proposals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className='text-center py-8'>
              <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No proposals yet</h3>
              <p className='text-sm text-muted-foreground'>
                Proposals will appear here once they are created
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
