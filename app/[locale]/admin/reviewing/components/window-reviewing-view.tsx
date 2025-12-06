'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from '@/app/i18n/navigation';
import { ProposalsReviewTable } from './proposals-review-table';
import { ReviewersSummaryTable } from './reviewers-summary-table';
import { useAction } from 'next-safe-action/hooks';
import { validateAndSendAllEmailsAction } from '@/lib/actions/reviewing-actions';
import { toast } from 'sonner';
import { useRouter } from '@/app/i18n/navigation';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface Proposal {
  id: string;
  title: string;
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
  submittedAt: Date | null;
  reviews: Array<{
    id: string;
    isDraft: boolean;
    deadline: Date;
    reviewer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  }>;
}

interface ReviewerSummary {
  reviewer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    centre: {
      code: string;
    } | null;
    reviewTopics: Array<{
      id: string;
      label: string;
      color: string | null;
    }>;
  };
  proposalCount: number;
  draftCount: number;
  validatedCount: number;
  lastEmailSentAt: Date | null;
  reviews: Array<{
    id: string;
    proposalId: string;
    isDraft: boolean;
    emailSentAt: Date | null;
    deadline: Date;
    proposal: {
      id: string;
      title: string;
      piUser: {
        firstName: string | null;
        lastName: string | null;
        email: string;
      };
      mainArea: {
        label: string;
        color: string | null;
      };
      centre: {
        code: string;
      } | null;
    };
  }>;
}

interface EligibleReviewer {
  id: string;
  name: string;
  email: string;
  assignmentCount: number;
  hasTopicMatch: boolean;
}

interface Window {
  id: string;
  name: string;
  status: string;
  proposals: Proposal[];
}

interface WindowReviewingViewProps {
  window: Window;
  reviewersSummary: ReviewerSummary[];
  eligibleReviewers: EligibleReviewer[];
}

export function WindowReviewingView({
  window,
  reviewersSummary,
  eligibleReviewers
}: WindowReviewingViewProps) {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { execute: sendAllEmails, status } = useAction(validateAndSendAllEmailsAction, {
    onSuccess: ({ data }) => {
      toast.success(
        `Successfully sent emails to ${data?.reviewerCount} reviewers for ${data?.proposalCount} proposals`
      );
      router.refresh();
      setShowConfirmDialog(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to send emails');
    }
  });

  const handleSendAll = () => {
    sendAllEmails({ windowId: window.id });
  };

  const hasDraftAssignments = reviewersSummary.some((r) => r.draftCount > 0);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/admin/reviewing'>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Windows
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>{window.name}</h1>
            <p className='text-muted-foreground mt-1'>
              {window.proposals.length} proposals • {reviewersSummary.length} reviewers assigned
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowConfirmDialog(true)}
          disabled={!hasDraftAssignments || status === 'executing'}
          size='lg'
        >
          <Send className='h-4 w-4 mr-2' />
          Validate & Send All Emails
        </Button>
      </div>

      <div className='space-y-6'>
        <div>
          <h2 className='text-xl font-semibold mb-4'>Proposals</h2>
          <ProposalsReviewTable proposals={window.proposals} reviewers={eligibleReviewers} />
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4'>Reviewers</h2>
          <ReviewersSummaryTable reviewersSummary={reviewersSummary} windowId={window.id} />
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Validate and Send All Emails?</AlertDialogTitle>
            <AlertDialogDescription>
              This will validate all draft assignments and send notification emails to all
              reviewers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendAll} disabled={status === 'executing'}>
              {status === 'executing' ? 'Sending...' : 'Confirm & Send'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
