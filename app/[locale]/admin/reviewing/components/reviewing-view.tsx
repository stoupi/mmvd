'use client';

import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ReviewingTable } from './reviewing-table';
import { Send } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { validateAssignmentsAction } from '@/lib/actions/reviewing-actions';
import { toast } from 'sonner';
import { useRouter } from '@/app/i18n/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Proposal {
  id: string;
  title: string;
  status: string;
  submittedAt: Date | null;
  piUser: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  centre: {
    code: string;
    name: string;
  } | null;
  mainArea: {
    id: string;
    label: string;
    color: string | null;
  };
  submissionWindow: {
    id: string;
    name: string;
    status: string;
  };
  reviews: Array<{
    id: string;
    decision: string | null;
    status: string;
  }>;
}

interface Reviewer {
  id: string;
  name: string;
  email: string;
  assignmentCount: number;
  hasTopicMatch: boolean;
}

interface ReviewingViewProps {
  proposals: Proposal[];
  windows: { id: string; name: string }[];
  reviewers: Reviewer[];
}

export function ReviewingView({ proposals, windows, reviewers }: ReviewingViewProps) {
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const router = useRouter();

  const { execute: validateAssignments, status: validateStatus } = useAction(
    validateAssignmentsAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success(
            `Validated ${data.reviewCount} review assignments for ${data.proposalCount} proposals. Emails sent to ${data.reviewerCount} reviewers.`
          );
          router.refresh();
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to validate assignments');
      }
    }
  );

  const filteredProposals = useMemo(() => {
    if (!selectedWindowId) return proposals;
    return proposals.filter((proposal) => proposal.submissionWindow.id === selectedWindowId);
  }, [proposals, selectedWindowId]);

  const draftAssignmentsCount = useMemo(() => {
    // Count would come from actual draft reviews, but we'll implement this in the table
    return 0;
  }, []);

  const handleValidateAssignments = () => {
    if (!selectedWindowId) {
      toast.error('Please select a submission window');
      return;
    }
    validateAssignments({ windowId: selectedWindowId });
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <div className='flex-1'>
          <label className='text-sm font-medium mb-2 block'>Filter by Submission Window</label>
          <Select
            value={selectedWindowId || 'all'}
            onValueChange={(value) => setSelectedWindowId(value === 'all' ? null : value)}
          >
            <SelectTrigger className='w-[300px]'>
              <SelectValue placeholder='All Windows' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Windows</SelectItem>
              {windows.map((window) => (
                <SelectItem key={window.id} value={window.id}>
                  {window.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedWindowId && (
          <div className='pt-6'>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={validateStatus === 'executing'}>
                  <Send className='h-4 w-4 mr-2' />
                  Validate & Send Emails
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Validate Reviewer Assignments</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will validate all draft reviewer assignments for this window and send
                    email notifications to assigned reviewers. Proposal statuses will change to
                    "Under Review". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleValidateAssignments}>
                    {validateStatus === 'executing' ? 'Validating...' : 'Confirm & Send Emails'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <ReviewingTable proposals={filteredProposals} reviewers={reviewers} />
    </div>
  );
}
