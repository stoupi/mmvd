'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { updateUserProfileAction, updateUserPermissionsAction } from '@/lib/actions/admin-actions';
import { updateUserProfileSchema } from '@/lib/schemas/admin';
import { Centre, AppPermission } from '@/app/generated/prisma';
import type { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

type FormData = Omit<z.infer<typeof updateUserProfileSchema>, 'userId'> & {
  permissions: AppPermission[];
};

interface EditUserDialogProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    title: string | null;
    affiliation: string | null;
    centreId: string | null;
    permissions: AppPermission[];
  };
  centres: Centre[];
}

const permissionOptions: Array<{ value: AppPermission; label: string }> = [
  { value: AppPermission.SUBMISSION, label: 'Submission' },
  { value: AppPermission.REVIEWING, label: 'Reviewing' },
  { value: AppPermission.ADMIN, label: 'Admin' }
];

export function EditUserDialog({ user, centres }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(updateUserProfileSchema.omit({ userId: true })),
    defaultValues: {
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      title: user.title || '',
      affiliation: user.affiliation || '',
      centreId: user.centreId || '',
      permissions: user.permissions || []
    }
  });

  const { execute: executeProfile, status: statusProfile } = useAction(updateUserProfileAction, {
    onSuccess: () => {
      toast.success('User updated successfully');
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update user');
    }
  });

  const { execute: executePermissions } = useAction(updateUserPermissionsAction);

  const handleSubmit = async (data: FormData) => {
    const { permissions, ...profileData } = data;

    // Update permissions first
    await executePermissions({ userId: user.id, permissions });

    // Then update profile
    executeProfile({ userId: user.id, ...profileData });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm'>
          <Edit className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update user information for {user.email}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder='john.doe@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === 'NONE' ? '' : value);
                    }}
                    value={field.value || 'NONE'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select title' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='NONE'>None</SelectItem>
                      <SelectItem value='Dr'>Dr</SelectItem>
                      <SelectItem value='Prof'>Prof</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder='John' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='affiliation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliation</FormLabel>
                  <FormControl>
                    <Input placeholder='University Hospital' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='centreId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centre</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a centre' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {centres.map((centre) => (
                        <SelectItem key={centre.id} value={centre.id}>
                          {centre.code} - {centre.name} ({centre.city}, {centre.countryCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='permissions'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-3 block'>Permissions</FormLabel>
                  <div className='flex gap-2'>
                    {permissionOptions.map((permission) => {
                      const isSelected = field.value?.includes(permission.value);
                      return (
                        <button
                          key={permission.value}
                          type='button'
                          onClick={() => {
                            const newValue = isSelected
                              ? field.value?.filter((value) => value !== permission.value)
                              : [...(field.value || []), permission.value];
                            field.onChange(newValue);
                          }}
                          className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {permission.label}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={statusProfile === 'executing'}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={statusProfile === 'executing'}>
                {statusProfile === 'executing' ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
