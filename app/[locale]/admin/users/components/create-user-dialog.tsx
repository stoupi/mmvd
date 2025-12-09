'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useParams } from 'next/navigation';
import { createUserAction } from '@/lib/actions/admin-actions';
import { createUserSchema } from '@/lib/schemas/admin';
import { AppPermission, Centre } from '@/app/generated/prisma';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

type CreateUserFormData = z.infer<typeof createUserSchema>;

const permissionOptions: Array<{ value: AppPermission; label: string }> = [
  { value: AppPermission.SUBMISSION, label: 'Submission' },
  { value: AppPermission.REVIEWING, label: 'Reviewing' },
  { value: AppPermission.ADMIN, label: 'Admin' }
];

interface CreateUserDialogProps {
  centres: Centre[];
}

export function CreateUserDialog({ centres }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      title: '',
      affiliation: '',
      centreId: '',
      permissions: [] as AppPermission[]
    }
  });

  const { execute, status } = useAction(createUserAction, {
    onSuccess: () => {
      toast.success('User created successfully');
      setOpen(false);
      form.reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to create user');
    }
  });

  const onSubmit = (data: z.infer<typeof createUserSchema>) => {
    if (!data.permissions || data.permissions.length === 0) {
      const confirmed = window.confirm(
        'Warning: No permissions selected. This user will not have access to any features. Do you want to continue?'
      );
      if (!confirmed) {
        return;
      }
    }
    execute(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='h-4 w-4 mr-2' />
          New User
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='John' />
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
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Doe' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} type='email' placeholder='john.doe@example.com' />
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
                  <FormLabel>Centre *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
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
              name='affiliation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliation</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='University Hospital' />
                  </FormControl>
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

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={status === 'executing'}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={status === 'executing'}>
                {status === 'executing' ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
