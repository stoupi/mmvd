'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Edit, CheckCircle, XCircle } from 'lucide-react';
import { EditUserDialog } from './edit-user-dialog';
import { PermissionsDialog } from './permissions-dialog';
import { ToggleUserStatusDialog } from './toggle-user-status-dialog';
import type { AppPermission } from '@prisma/client';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  affiliation: string | null;
  centreCode: string | null;
  permissions: AppPermission[];
  isActive: boolean;
  createdAt: Date;
  _count: {
    proposalsAsPi: number;
    reviews: number;
  };
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Centre Code</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className='font-medium'>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : 'No name'}
                  </div>
                  <div className='text-sm text-muted-foreground'>{user.email}</div>
                  {user.affiliation && (
                    <div className='text-xs text-muted-foreground'>{user.affiliation}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {user.centreCode ? (
                  <Badge variant='outline'>{user.centreCode}</Badge>
                ) : (
                  <span className='text-sm text-muted-foreground'>Not assigned</span>
                )}
              </TableCell>
              <TableCell>
                <PermissionsDialog user={user} />
              </TableCell>
              <TableCell>
                <div className='text-sm'>
                  <div>{user._count.proposalsAsPi} proposals</div>
                  <div className='text-muted-foreground'>{user._count.reviews} reviews</div>
                </div>
              </TableCell>
              <TableCell>
                {user.isActive ? (
                  <Badge className='bg-green-500'>
                    <CheckCircle className='h-3 w-3 mr-1' />
                    Active
                  </Badge>
                ) : (
                  <Badge variant='destructive'>
                    <XCircle className='h-3 w-3 mr-1' />
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end gap-2'>
                  <EditUserDialog user={user} />
                  <ToggleUserStatusDialog
                    userId={user.id}
                    userName={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                    currentStatus={user.isActive}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
