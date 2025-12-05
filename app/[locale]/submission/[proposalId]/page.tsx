import { requirePermissionGuard } from '@/lib/auth-guard';
import { getProposal, getMainAreas, getProposalsByPi } from '@/lib/services/submission';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import { Edit, ArrowLeft, Calendar, Clock, Trash2 } from 'lucide-react';
import { ProposalActions } from '../components/proposal-actions';
import { ProposalForm } from '../components/proposal-form';

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

  const mainAreas = await getMainAreas();
  const isDraft = proposal.status === 'DRAFT';
  const isWindowOpen = proposal.submissionWindow.status === 'OPEN';

  // Check if user has already submitted a proposal in this window
  const allProposals = await getProposalsByPi(session.user.id);
  const hasSubmittedInWindow = allProposals.some(
    (p) => p.submissionWindowId === proposal.submissionWindowId && p.status === 'SUBMITTED'
  );

  // Calculate days remaining
  const daysRemaining = Math.ceil(
    (new Date(proposal.submissionWindow.submissionCloseAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const initialData = {
    title: proposal.title,
    mainAreaId: proposal.mainAreaId,
    secondaryTopics: proposal.secondaryTopics,
    scientificBackground: proposal.scientificBackground,
    literaturePosition: proposal.literaturePosition || '',
    competingWork: proposal.competingWork as any[],
    primaryObjective: proposal.primaryObjective,
    secondaryObjectives: proposal.secondaryObjectives,
    mainExposure: proposal.mainExposure,
    primaryEndpoint: proposal.primaryEndpoint,
    secondaryEndpoints: proposal.secondaryEndpoints,
    studyPopulation: proposal.studyPopulation,
    inclusionCriteria: proposal.inclusionCriteria || '',
    exclusionCriteria: proposal.exclusionCriteria || '',
    dataBaseline: proposal.dataBaseline,
    dataBiological: proposal.dataBiological,
    dataTTE: proposal.dataTTE,
    dataTOE: proposal.dataTOE,
    dataStressEcho: proposal.dataStressEcho,
    dataCMR: proposal.dataCMR,
    dataCT: proposal.dataCT,
    dataRHC: proposal.dataRHC,
    dataHospitalFollowup: proposal.dataHospitalFollowup,
    dataClinicalFollowup: proposal.dataClinicalFollowup,
    dataTTEFollowup: proposal.dataTTEFollowup,
    dataCoreLab: proposal.dataCoreLab,
    analysisTypes: proposal.analysisTypes as ('logistic' | 'cox' | 'propensity' | 'ml')[],
    analysisDescription: proposal.analysisDescription || '',
    adjustmentCovariates: proposal.adjustmentCovariates || '',
    subgroupAnalyses: proposal.subgroupAnalyses || '',
    targetJournals: [
      proposal.targetJournals[0] || '',
      proposal.targetJournals[1] || '',
      proposal.targetJournals[2] || ''
    ]
  };

  return (
    <div className='container mx-auto py-8 max-w-4xl'>
      <div className='mb-6'>
        <Link href='/submission'>
          <Button variant='outline' size='sm' className='mb-4 border-pink-600 text-pink-600 hover:bg-pink-50 hover:text-pink-700'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to proposals
          </Button>
        </Link>

        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-3xl font-bold'>Proposal of Ancillary Study</h1>
          {isDraft && isWindowOpen && !hasSubmittedInWindow && (
            <Link href={`/submission/${proposalId}/edit`}>
              <Button variant='outline'>
                <Edit className='h-4 w-4 mr-2' />
                Edit Draft
              </Button>
            </Link>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-3 mb-2'>
          <Badge className={statusColors[proposal.status]}>
            {statusLabels[proposal.status]}
          </Badge>
          <span className='text-lg font-semibold'>{proposal.submissionWindow.name}</span>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Calendar className='h-4 w-4' />
            <span>
              {new Date(proposal.submissionWindow.submissionOpenAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
              {' - '}
              {new Date(proposal.submissionWindow.submissionCloseAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          {isWindowOpen && (
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-pink-600' />
              <span className='font-semibold text-pink-600'>
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
              </span>
            </div>
          )}
        </div>
      </div>

      {isDraft && isWindowOpen && !hasSubmittedInWindow && (
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

      {isDraft && isWindowOpen && hasSubmittedInWindow && (
        <Card className='mb-6 border-yellow-200 bg-yellow-50'>
          <CardContent className='pt-6'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='font-semibold text-yellow-900 mb-1'>Draft cannot be submitted</h3>
                <p className='text-sm text-yellow-700'>
                  You have already submitted a proposal for this submission window. You can only delete this draft.
                </p>
              </div>
              <ProposalActions proposalId={proposalId} showSubmit={false} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className='pt-6'>
          <ProposalForm
            initialData={initialData}
            proposalId={proposalId}
            mainAreas={mainAreas}
            submissionWindowId={proposal.submissionWindowId}
            centreId={proposal.centreId}
            isEditing={false}
            readOnly={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
