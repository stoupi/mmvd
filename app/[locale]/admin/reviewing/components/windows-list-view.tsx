import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import { ChevronRight, Calendar, ClipboardCheck, Users } from 'lucide-react';
import { WindowStatusBadge } from '@/components/window-status-badge';
import type { WindowStatus } from '@/app/generated/prisma';

interface Window {
  id: string;
  name: string;
  status: WindowStatus;
  submissionOpenAt: Date;
  submissionCloseAt: Date;
  proposalCount: number;
  draftCount: number;
  validatedCount: number;
  reviewerCount: number;
}

interface WindowsListViewProps {
  windows: Window[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function WindowsListView({ windows }: WindowsListViewProps) {
  if (windows.length === 0) {
    return (
      <div className='text-center py-12'>
        <Calendar className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
        <h3 className='text-lg font-semibold mb-2'>No submission windows</h3>
        <p className='text-sm text-muted-foreground'>
          Submission windows will appear here once they are created
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {windows.map((window) => (
        <Card key={window.id} className='hover:shadow-lg transition-shadow'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <CardTitle className='text-xl'>{window.name}</CardTitle>
              <WindowStatusBadge status={window.status} />
            </div>
            <p className='text-sm text-muted-foreground mt-2'>
              {formatDate(window.submissionOpenAt)} - {formatDate(window.submissionCloseAt)}
            </p>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <ClipboardCheck className='h-4 w-4' />
                  <span>Proposals</span>
                </div>
                <span className='font-semibold'>{window.proposalCount}</span>
              </div>

              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Users className='h-4 w-4' />
                  <span>Reviewers</span>
                </div>
                <span className='font-semibold'>{window.reviewerCount}</span>
              </div>

              <div className='flex items-center justify-between text-sm pt-2 border-t'>
                <span className='text-muted-foreground'>Assignments</span>
                <div className='flex gap-2'>
                  <Badge variant='outline' className='bg-yellow-50 text-yellow-700 border-yellow-200'>
                    {window.draftCount}D
                  </Badge>
                  <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
                    {window.validatedCount}V
                  </Badge>
                </div>
              </div>
            </div>

            <Link href={`/admin/reviewing/${window.id}`}>
              <Button className='w-full mt-4' variant='default'>
                Manage Assignments
                <ChevronRight className='h-4 w-4 ml-2' />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
