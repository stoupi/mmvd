'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Edit, CheckCircle, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { EditUserDialog } from './edit-user-dialog';
import { PermissionsDialog } from './permissions-dialog';
import { ToggleUserStatusDialog } from './toggle-user-status-dialog';
import { ReviewTopicsDialog } from './review-topics-dialog';
import type { AppPermission, Centre } from '@/app/generated/prisma';

interface ReviewTopic {
  id: string;
  code: string | null;
  label: string;
}

interface User {
  id: string;
  email: string;
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
type SortOrder = 'asc' | 'desc';

export function UsersTable({ users, allMainAreas, centres }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [permissionFilter, setPermissionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className='h-4 w-4 ml-1' />;
    return sortOrder === 'asc' ? (
      <ArrowUp className='h-4 w-4 ml-1' />
    ) : (
      <ArrowDown className='h-4 w-4 ml-1' />
    );
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
      <div className='flex gap-4'>
        <Input
          placeholder='Search by name, email, or centre...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-sm'
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={permissionFilter} onValueChange={setPermissionFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by permission' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Permissions</SelectItem>
            <SelectItem value='SUBMISSION'>Submission</SelectItem>
            <SelectItem value='REVIEWING'>Reviewing</SelectItem>
            <SelectItem value='ADMIN'>Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='rounded-md border bg-white'>
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                onClick={() => handleSort('name')}
                className='flex items-center hover:text-foreground'
              >
                User
                <SortIcon field='name' />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('centreCode')}
                className='flex items-center hover:text-foreground'
              >
                Centre Code
                <SortIcon field='centreCode' />
              </button>
            </TableHead>
            <TableHead>Centre Name</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('email')}
                className='flex items-center hover:text-foreground'
              >
                Email
                <SortIcon field='email' />
              </button>
            </TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Review Topics</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('status')}
                className='flex items-center hover:text-foreground'
              >
                Status
                <SortIcon field='status' />
              </button>
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
                  <EditUserDialog user={user} centres={centres} />
                  <ToggleUserStatusDialog
                    userId={user.id}
                    userName={`${user.title ? user.title + ' ' : ''}${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                    currentStatus={user.isActive}
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
