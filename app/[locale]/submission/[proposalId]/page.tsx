import { requirePermissionGuard } from '@/lib/auth-guard';
import { getProposal } from '@/lib/services/submission';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import { Calendar, FileText, Users, Edit, Send } from 'lucide-react';
import { ProposalActions } from '../components/proposal-actions';

const statusColors = {
  DRAFT: 'bg-gray-500',
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-yellow-500',
  ACCEPTED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  PRIORITIZED: 'bg-purple-500'
};

const statusLabels = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  PRIORITIZED: 'Prioritized'
};

export default async function ProposalDetailPage({
  params
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  const session = await requirePermissionGuard('SUBMISSION');

  const proposal = await getProposal(proposalId);

  if (!proposal) {
    notFound();
  }

  // Verify ownership
  if (proposal.piUserId !== session.user.id) {
    redirect('/submission');
  }

  const isDraft = proposal.status === 'DRAFT';

  return (
    <div className='container mx-auto py-8 max-w-5xl'>
      {/* Header */}
      <div className='flex items-start justify-between mb-6'>
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-2'>
            <h1 className='text-3xl font-bold'>{proposal.title}</h1>
            <Badge className={statusColors[proposal.status]}>
              {statusLabels[proposal.status]}
            </Badge>
          </div>
          <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <FileText className='h-4 w-4' />
              <span>{proposal.mainArea.label}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Calendar className='h-4 w-4' />
              <span>{proposal.submissionWindow.name}</span>
            </div>
            {proposal.reviews.length > 0 && (
              <div className='flex items-center gap-1'>
                <Users className='h-4 w-4' />
                <span>{proposal.reviews.length} review(s)</span>
              </div>
            )}
          </div>
        </div>

        {isDraft && (
          <div className='flex gap-2'>
            <Link href={`/submission/${proposalId}/edit`}>
              <Button variant='outline'>
                <Edit className='h-4 w-4 mr-2' />
                Edit Draft
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Submission Actions */}
      {isDraft && (
        <Card className='mb-6 border-blue-200 bg-blue-50'>
          <CardContent className='pt-6'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='font-semibold text-blue-900 mb-1'>Ready to submit?</h3>
                <p className='text-sm text-blue-700'>
                  Once submitted, you will not be able to edit or delete this proposal.
                </p>
              </div>
              <ProposalActions proposalId={proposalId} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proposal Content */}
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Background</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='whitespace-pre-wrap text-sm'>{proposal.background}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='whitespace-pre-wrap text-sm'>{proposal.objectives}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='whitespace-pre-wrap text-sm'>{proposal.methods}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistical Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='whitespace-pre-wrap text-sm'>{proposal.statisticalAnalysis}</p>
          </CardContent>
        </Card>

        {proposal.expectedImpact && (
          <Card>
            <CardHeader>
              <CardTitle>Expected Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap text-sm'>{proposal.expectedImpact}</p>
            </CardContent>
          </Card>
        )}

        {proposal.references && (
          <Card>
            <CardHeader>
              <CardTitle>References</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap text-sm'>{proposal.references}</p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <dt className='font-medium text-muted-foreground'>Centre Code</dt>
                <dd className='mt-1'>{proposal.centreCode}</dd>
              </div>
              {proposal.nPatients && (
                <div>
                  <dt className='font-medium text-muted-foreground'>Number of Patients</dt>
                  <dd className='mt-1'>{proposal.nPatients}</dd>
                </div>
              )}
              {proposal.statisticianName && (
                <div>
                  <dt className='font-medium text-muted-foreground'>Statistician</dt>
                  <dd className='mt-1'>{proposal.statisticianName}</dd>
                </div>
              )}
              <div>
                <dt className='font-medium text-muted-foreground'>Created</dt>
                <dd className='mt-1'>{new Date(proposal.createdAt).toLocaleDateString()}</dd>
              </div>
              {proposal.submittedAt && (
                <div>
                  <dt className='font-medium text-muted-foreground'>Submitted</dt>
                  <dd className='mt-1'>{new Date(proposal.submittedAt).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
