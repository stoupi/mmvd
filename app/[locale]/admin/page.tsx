import { requirePermissionGuard } from '@/lib/auth-guard';
import { getAdminStatistics, getAllSubmissionWindows } from '@/lib/services/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import {
  Users,
  FileText,
  Calendar,
  BarChart,
  Settings,
  FolderOpen
} from 'lucide-react';

const statusColors = {
  PLANNED: 'bg-gray-500',
  OPEN: 'bg-green-500',
  CLOSED: 'bg-orange-500',
  REVIEWING: 'bg-blue-500',
  COMPLETED: 'bg-purple-500'
};

const statusLabels = {
  PLANNED: 'Planned',
  OPEN: 'Open',
  CLOSED: 'Closed',
  REVIEWING: 'Under Review',
  COMPLETED: 'Completed'
};

export default async function AdminDashboardPage() {
  await requirePermissionGuard('ADMIN');

  const stats = await getAdminStatistics();
  const windows = await getAllSubmissionWindows();
  const recentWindows = windows.slice(0, 5);

  return (
    <div className='container mx-auto py-8 max-w-7xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Admin Dashboard</h1>
        <p className='text-muted-foreground'>
          Manage users, submission windows, main areas, and proposals
        </p>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.users.total}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.users.active} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Proposals</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.proposals.total}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.proposals.submitted} submitted, {stats.proposals.drafts} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Submission Windows</CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.windows.total}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.windows.open} currently open
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Link href='/admin/users'>
              <Button variant='outline' className='w-full h-auto flex flex-col items-start p-4'>
                <Users className='h-5 w-5 mb-2' />
                <span className='font-semibold'>Manage Users</span>
                <span className='text-xs text-muted-foreground'>
                  View and edit user accounts
                </span>
              </Button>
            </Link>

            <Link href='/admin/windows'>
              <Button variant='outline' className='w-full h-auto flex flex-col items-start p-4'>
                <Calendar className='h-5 w-5 mb-2' />
                <span className='font-semibold'>Submission Windows</span>
                <span className='text-xs text-muted-foreground'>
                  Manage submission periods
                </span>
              </Button>
            </Link>

            <Link href='/admin/main-areas'>
              <Button variant='outline' className='w-full h-auto flex flex-col items-start p-4'>
                <FolderOpen className='h-5 w-5 mb-2' />
                <span className='font-semibold'>Main Areas</span>
                <span className='text-xs text-muted-foreground'>
                  Manage research areas
                </span>
              </Button>
            </Link>

            <Link href='/admin/proposals'>
              <Button variant='outline' className='w-full h-auto flex flex-col items-start p-4'>
                <FileText className='h-5 w-5 mb-2' />
                <span className='font-semibold'>All Proposals</span>
                <span className='text-xs text-muted-foreground'>
                  View and manage proposals
                </span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Submission Windows */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Recent Submission Windows</CardTitle>
            <Link href='/admin/windows'>
              <Button variant='ghost' size='sm'>
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentWindows.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No submission windows created yet</p>
          ) : (
            <div className='space-y-4'>
              {recentWindows.map((window) => (
                <div
                  key={window.id}
                  className='flex items-center justify-between p-4 border rounded-lg'
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='font-semibold'>{window.name}</h3>
                      <Badge className={statusColors[window.status]}>
                        {statusLabels[window.status]}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {new Date(window.submissionStart).toLocaleDateString()} -{' '}
                      {new Date(window.submissionEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='text-right'>
                      <div className='text-sm font-medium'>{window._count.proposals}</div>
                      <div className='text-xs text-muted-foreground'>proposals</div>
                    </div>
                    <Link href={`/admin/windows/${window.id}`}>
                      <Button variant='ghost' size='sm'>
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
