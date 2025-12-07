import { requirePermissionGuard } from '@/lib/auth-guard';
import { getProposal, getCategoriesWithTopics, getAllProposalCounts, getProposalsByPi } from '@/lib/services/submission';
import { redirect, notFound } from 'next/navigation';
import { ProposalForm } from '../../components/proposal-form';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { ProposalActions } from '../../components/proposal-actions';

export default async function EditProposalPage({
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

  // Only allow editing drafts
  if (proposal.status !== 'DRAFT') {
    redirect(`/submission/${proposalId}`);
  }

  const categoriesWithTopics = await getCategoriesWithTopics();
  const isWindowOpen = proposal.submissionWindow.status === 'OPEN';

  // Calculate days remaining
  const daysRemaining = Math.ceil(
    (new Date(proposal.submissionWindow.submissionCloseAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Check if user has already submitted a proposal in this window
  const allProposals = await getProposalsByPi(session.user.id);
  const hasSubmittedInWindow = allProposals.some(
    (p) => p.submissionWindowId === proposal.submissionWindowId && p.status === 'SUBMITTED'
  );

  // Get proposal counts for all topics (bulk fetch optimization)
  const proposalCounts = await getAllProposalCounts(proposal.submissionWindowId);

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
        <h1 className='text-3xl font-bold mb-4'>Edit Proposal of Ancillary Study</h1>

        <div className='flex flex-wrap items-center gap-3 mb-2'>
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

      {isWindowOpen && !hasSubmittedInWindow && (
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

      <Card>
        <CardContent className='pt-6'>
          <ProposalForm
            initialData={initialData}
            proposalId={proposalId}
            categoriesWithTopics={categoriesWithTopics}
            submissionWindowId={proposal.submissionWindowId}
            centreId={proposal.centreId}
            isEditing={true}
            proposalCounts={proposalCounts}
          />
        </CardContent>
      </Card>
    </div>
  );
}
