'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { updateUserPermissionsAction } from '@/lib/actions/admin-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { AppPermission } from '@prisma/client';

interface PermissionsDialogProps {
  user: {
    id: string;
    email: string;
    permissions: AppPermission[];
  };
}

const PERMISSION_LABELS = {
  SUBMISSION: 'Submission',
  REVIEWING: 'Reviewing',
  ADMIN: 'Admin'
};

const PERMISSION_DESCRIPTIONS = {
  SUBMISSION: 'Can submit and manage proposals',
  REVIEWING: 'Can review proposals',
  ADMIN: 'Full administrative access'
};

export function PermissionsDialog({ user }: PermissionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<AppPermission[]>(
    user.permissions
  );

  const { execute, status } = useAction(updateUserPermissionsAction, {
    onSuccess: () => {
      toast.success('Permissions updated successfully');
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update permissions');
      setSelectedPermissions(user.permissions);
    }
  });

  const handlePermissionToggle = (permission: AppPermission, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permission]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permission));
    }
  };

  const handleSave = () => {
    execute({ userId: user.id, permissions: selectedPermissions });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm' className='h-auto flex flex-wrap gap-1 p-1'>
          {user.permissions.length === 0 ? (
            <Badge variant='outline'>No permissions</Badge>
          ) : (
            user.permissions.map((permission) => (
              <Badge key={permission} variant='secondary' className='text-xs'>
                {PERMISSION_LABELS[permission]}
              </Badge>
            ))
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Update permissions for {user.email}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
            const permission = key as AppPermission;
            return (
              <div key={permission} className='flex items-start space-x-3'>
                <Checkbox
                  id={permission}
                  checked={selectedPermissions.includes(permission)}
                  onCheckedChange={(checked) =>
                    handlePermissionToggle(permission, checked as boolean)
                  }
                />
                <div className='flex-1'>
                  <Label htmlFor={permission} className='font-medium cursor-pointer'>
                    {label}
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    {PERMISSION_DESCRIPTIONS[permission]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className='flex justify-end gap-2'>
          <Button
            variant='outline'
            onClick={() => {
              setOpen(false);
              setSelectedPermissions(user.permissions);
            }}
            disabled={status === 'executing'}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={status === 'executing'}>
            {status === 'executing' ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
