'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useAction } from 'next-safe-action/hooks';
import { updateProposalStatusAction } from '@/lib/actions/admin-proposal-actions';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { ProposalStatus } from '@/app/generated/prisma';
import { useRouter } from '@/app/i18n/navigation';

interface AdminDecisionFormProps {
  proposalId: string;
  currentStatus: ProposalStatus;
  reviewCount: number;
  completedReviewCount: number;
}

export function AdminDecisionForm({
  proposalId,
  currentStatus,
  reviewCount,
  completedReviewCount
}: AdminDecisionFormProps) {
  const router = useRouter();
  const [newStatus, setNewStatus] = useState<ProposalStatus | ''>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { execute, status } = useAction(updateProposalStatusAction, {
    onSuccess: () => {
      toast.success('Proposal status updated successfully');
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update proposal status');
    }
  });

  const handleSubmit = () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    if (completedReviewCount === 0) {
      toast.error('Cannot make a decision without any completed reviews');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (newStatus) {
      execute({
        proposalId,
        status: newStatus
      });
    }
    setShowConfirmDialog(false);
  };

  const isExecuting = status === 'executing';

  // Don't show form for draft proposals
  if (currentStatus === 'DRAFT') {
    return null;
  }

  const statusOptions = [
    {
      value: 'ACCEPTED' as const,
      label: 'Accept Proposal',
      description: 'The proposal is approved and can proceed',
      icon: <CheckCircle2 className='h-5 w-5 text-green-600' />
    },
    {
      value: 'REJECTED' as const,
      label: 'Reject Proposal',
      description: 'The proposal is rejected and cannot be resubmitted',
      icon: <XCircle className='h-5 w-5 text-red-600' />
    },
    {
      value: 'REVISION_REQUIRED' as const,
      label: 'Request Revisions',
      description: 'The PI must address reviewer comments and resubmit',
      icon: <AlertCircle className='h-5 w-5 text-yellow-600' />
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Admin Final Decision</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <p className='text-sm text-blue-800'>
              <strong>Review Status:</strong> {completedReviewCount} of {reviewCount} reviews completed
            </p>
            {completedReviewCount === 0 && (
              <p className='text-sm text-blue-800 mt-2'>
                You must wait for at least one reviewer to complete their review before making a decision.
              </p>
            )}
          </div>

          <div className='space-y-4'>
            <Label>Select Final Decision</Label>
            <RadioGroup value={newStatus} onValueChange={(value) => setNewStatus(value as ProposalStatus)}>
              {statusOptions.map((option) => (
                <div
                  key={option.value}
                  className='flex items-start space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer'
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className='flex items-start gap-3 flex-1'>
                    {option.icon}
                    <label htmlFor={option.value} className='flex-1 cursor-pointer'>
                      <div className='font-medium'>{option.label}</div>
                      <div className='text-sm text-muted-foreground'>{option.description}</div>
                    </label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isExecuting || !newStatus || completedReviewCount === 0}
            className='w-full'
          >
            Submit Decision
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-2xl text-gray-900'>
              Confirm Proposal Decision
            </AlertDialogTitle>
            <div className='text-gray-900 space-y-4 pt-2'>
              <div className='font-semibold text-base'>
                Are you sure you want to update this proposal&apos;s status?
              </div>
              <div>
                <div className='text-sm mb-2'>This action will:</div>
                <ul className='text-sm space-y-1 list-disc list-inside pl-2'>
                  <li>Update the proposal status to <strong>{newStatus}</strong></li>
                  {newStatus === 'ACCEPTED' && (
                    <li>Mark the proposal as <strong>approved for execution</strong></li>
                  )}
                  {newStatus === 'REJECTED' && (
                    <li>The PI will be <strong>notified of the rejection</strong></li>
                  )}
                  {newStatus === 'REVISION_REQUIRED' && (
                    <>
                      <li>The PI will be able to <strong>view all reviewer comments</strong></li>
                      <li>The PI can <strong>revise and resubmit</strong> the proposal</li>
                    </>
                  )}
                  <li>This action can be <strong>changed later</strong> if needed</li>
                </ul>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isExecuting}>
              {isExecuting ? 'Updating...' : 'Confirm Decision'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
