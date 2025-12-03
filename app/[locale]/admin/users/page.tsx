import { requirePermissionGuard } from '@/lib/auth-guard';
import { getAllUsers } from '@/lib/services/admin';
import { Users } from 'lucide-react';
import { UsersTable } from './components/users-table';
import { CreateUserDialog } from './components/create-user-dialog';

export default async function UsersPage() {
  await requirePermissionGuard('ADMIN');

  const users = await getAllUsers();

  return (
    <div className='p-8'>
      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Users</h1>
          <p className='text-muted-foreground'>
            Manage user accounts, permissions, and centre assignments
          </p>
        </div>
        <CreateUserDialog />
      </div>

      {users.length === 0 ? (
        <div className='text-center py-8'>
          <Users className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No users yet</h3>
          <p className='text-sm text-muted-foreground'>
            Users will appear here once they are created
          </p>
        </div>
      ) : (
        <UsersTable users={users} />
      )}
    </div>
  );
}
