'use client';

import { useState, useEffect } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { sendInvitationAction } from '@/lib/actions/admin-actions';
import { generateEmailPreview } from '@/lib/services/email';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import type { AppPermission } from '@/app/generated/prisma';

interface SendInviteDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
  userPermissions: AppPermission[];
  userTitle?: string | null;
  userFirstName?: string | null;
  userLastName?: string | null;
  centreCode?: string | null;
  centreName?: string | null;
}

export function SendInviteDialog({
  userId,
  userName,
  userEmail,
  userPermissions,
  userTitle,
  userFirstName,
  userLastName,
  centreCode,
  centreName,
}: SendInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [emailPreview, setEmailPreview] = useState<{ subject: string; html: string; text: string }>();
  const [customSubject, setCustomSubject] = useState('');
  const [customHtml, setCustomHtml] = useState('');
  const [customText, setCustomText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (open && !emailPreview) {
      const preview = generateEmailPreview({
        firstName: userFirstName || undefined,
        lastName: userLastName || undefined,
        title: userTitle || undefined,
        permissions: userPermissions,
        centreCode: centreCode || undefined,
        centreName: centreName || undefined,
      });
      setEmailPreview(preview);
      setCustomSubject(preview.subject);
      setCustomHtml(preview.html);
      setCustomText(preview.text);
    }
  }, [open, emailPreview, userFirstName, userLastName, userTitle, userPermissions, centreCode, centreName]);

  const { execute, status } = useAction(sendInvitationAction, {
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      setOpen(false);
      setIsEditing(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to send invitation');
    }
  });

  const handleSendInvite = () => {
    execute({
      userId,
      customSubject: isEditing ? customSubject : undefined,
      customHtml: isEditing ? customHtml : undefined,
      customText: isEditing ? customText : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Mail className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[95vw] !max-w-[1400px] max-h-[90vh] overflow-y-auto sm:!max-w-[1400px]'>
        <DialogHeader>
          <DialogTitle>Send Invitation Email</DialogTitle>
          <DialogDescription>
            Preview and customize the invitation email for <strong>{userName}</strong> ({userEmail})
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Label>Email Preview</Label>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Email'}
            </Button>
          </div>

          {emailPreview && (
            <Tabs defaultValue='preview' className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='preview'>Preview</TabsTrigger>
                <TabsTrigger value='source'>Source</TabsTrigger>
              </TabsList>

              <TabsContent value='preview' className='space-y-4'>
                {isEditing && (
                  <div className='space-y-2'>
                    <Label>Subject</Label>
                    <Input
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                    />
                  </div>
                )}
                {!isEditing && (
                  <div className='space-y-2'>
                    <Label>Subject</Label>
                    <div className='p-3 bg-muted rounded-md text-sm'>
                      {customSubject}
                    </div>
                  </div>
                )}

                <div className='space-y-2'>
                  <Label>HTML Content</Label>
                  {isEditing ? (
                    <textarea
                      value={customHtml}
                      onChange={(e) => setCustomHtml(e.target.value)}
                      className='w-full min-h-[400px] p-3 border rounded-md font-mono text-sm'
                    />
                  ) : (
                    <div
                      className='border rounded-md p-4 bg-white max-h-[500px] overflow-y-auto'
                      dangerouslySetInnerHTML={{ __html: customHtml }}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value='source' className='space-y-4'>
                <div className='space-y-2'>
                  <Label>Plain Text Version</Label>
                  {isEditing ? (
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className='w-full min-h-[300px] p-3 border rounded-md font-mono text-sm'
                    />
                  ) : (
                    <pre className='p-3 bg-muted rounded-md text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto'>
                      {customText}
                    </pre>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSendInvite}
            disabled={status === 'executing'}
          >
            {status === 'executing' ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
