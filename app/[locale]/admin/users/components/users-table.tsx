'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';
import { StatusBadge } from '@/components/design-system/status-badge';
import { DataTableColumnHeader } from '@/components/design-system/data-table-column-header';
import { DataTableToolbar } from '@/components/design-system/data-table-toolbar';
import { EditUserDialog } from './edit-user-dialog';
import { PermissionsDialog } from './permissions-dialog';
import { ToggleUserStatusDialog } from './toggle-user-status-dialog';
import { ReviewTopicsDialog } from './review-topics-dialog';
import { DeleteUserDialog } from './delete-user-dialog';
import { SendInviteDialog } from './send-invite-dialog';
import type { AppPermission, Centre } from '@/app/generated/prisma';

interface ReviewTopic {
  id: string;
  code: string | null;
  label: string;
}

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  affiliation: string | null;
  centreId: string | null;
  centre?: {
    code: string;
    name: string;
  } | null;
  permissions: AppPermission[];
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  reviewTopics: ReviewTopic[];
  _count: {
    proposalsAsPi: number;
    reviews: number;
  };
}

interface UsersTableProps {
  users: User[];
  allMainAreas: ReviewTopic[];
  centres: Centre[];
}

type SortField = 'name' | 'centreCode' | 'email' | 'status';

export function UsersTable({ users, allMainAreas, centres }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [permissionFilter, setPermissionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const fullName = `${user.title || ''} ${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        fullName.includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.centre?.code?.toLowerCase().includes(searchLower) ||
        user.centre?.name?.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);

      const matchesPermission =
        permissionFilter === 'all' ||
        user.permissions.includes(permissionFilter as AppPermission);

      return matchesSearch && matchesStatus && matchesPermission;
    });

    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'name':
          aValue = `${a.title || ''} ${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
          bValue = `${b.title || ''} ${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
          break;
        case 'centreCode':
          aValue = a.centre?.code?.toLowerCase() || '';
          bValue = b.centre?.code?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'status':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, statusFilter, permissionFilter, sortField, sortOrder]);

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder='Search by name, email, or centre...'
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            placeholder: 'Filter by status',
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          },
          {
            value: permissionFilter,
            onChange: setPermissionFilter,
            placeholder: 'Filter by permission',
            options: [
              { value: 'all', label: 'All Permissions' },
              { value: 'SUBMISSION', label: 'Submission' },
              { value: 'REVIEWING', label: 'Reviewing' },
              { value: 'ADMIN', label: 'Admin' }
            ]
          }
        ]}
      />

      <div className='rounded-md border bg-white'>
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <DataTableColumnHeader
                field='name'
                label='User'
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>
              <DataTableColumnHeader
                field='centreCode'
                label='Centre Code'
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>Centre Name</TableHead>
            <TableHead>
              <DataTableColumnHeader
                field='email'
                label='Email'
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Review Topics</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Enrollment</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>
              <DataTableColumnHeader
                field='status'
                label='Status'
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className='font-medium'>
                  {user.title && `${user.title} `}
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'No name'}
                </div>
              </TableCell>
              <TableCell>
                {user.centre?.code ? (
                  <Badge variant='outline'>{user.centre.code}</Badge>
                ) : (
                  <span className='text-sm text-muted-foreground'>-</span>
                )}
              </TableCell>
              <TableCell>
                {user.centre?.name || <span className='text-sm text-muted-foreground'>-</span>}
              </TableCell>
              <TableCell>
                <div className='text-sm'>{user.email}</div>
                {user.affiliation && (
                  <div className='text-xs text-muted-foreground'>{user.affiliation}</div>
                )}
              </TableCell>
              <TableCell>
                <PermissionsDialog user={user} />
              </TableCell>
              <TableCell>
                <ReviewTopicsDialog
                  userId={user.id}
                  userName={`${user.title ? user.title + ' ' : ''}${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                  isReviewer={user.permissions.includes('REVIEWING')}
                  currentTopics={user.reviewTopics}
                  allMainAreas={allMainAreas}
                />
              </TableCell>
              <TableCell>
                <div className='text-sm'>
                  <div>{user._count.proposalsAsPi} proposals</div>
                  <div className='text-muted-foreground'>{user._count.reviews} reviews</div>
                </div>
              </TableCell>
              <TableCell>
                {user.emailVerified ? (
                  <StatusBadge variant='success' text='Enrolled' />
                ) : (
                  <StatusBadge variant='warning' text='Pending' />
                )}
              </TableCell>
              <TableCell>
                <div className='text-sm text-muted-foreground'>
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Never'}
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-1'>
                  {user.isActive ? (
                    <>
                      <CheckCircle className='h-3 w-3' />
                      <StatusBadge variant='success' text='Active' />
                    </>
                  ) : (
                    <>
                      <XCircle className='h-3 w-3' />
                      <StatusBadge variant='error' text='Inactive' />
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end gap-2'>
                  {!user.emailVerified && (
                    <SendInviteDialog
                      userId={user.id}
                      userName={`${user.title ? user.title + ' ' : ''}${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                      userEmail={user.email}
                    />
                  )}
                  <EditUserDialog user={user} centres={centres} />
                  <ToggleUserStatusDialog
                    userId={user.id}
                    userName={`${user.title ? user.title + ' ' : ''}${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                    currentStatus={user.isActive}
                  />
                  <DeleteUserDialog
                    userId={user.id}
                    userName={`${user.title ? user.title + ' ' : ''}${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
