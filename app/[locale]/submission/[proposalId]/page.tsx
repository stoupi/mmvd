import { requirePermissionGuard } from '@/lib/auth-guard';
import { getProposal, getMainAreas } from '@/lib/services/submission';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import { Edit } from 'lucide-react';
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
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <h1 className='text-3xl font-bold'>Proposal Details</h1>
          <Badge className={statusColors[proposal.status]}>
            {statusLabels[proposal.status]}
          </Badge>
        </div>
        {isDraft && isWindowOpen && (
          <Link href={`/submission/${proposalId}/edit`}>
            <Button variant='outline'>
              <Edit className='h-4 w-4 mr-2' />
              Edit Draft
            </Button>
          </Link>
        )}
      </div>

      <div className='flex items-center gap-3 mb-6'>
        <p className='text-muted-foreground'>
          {proposal.submissionWindow.name}
        </p>
        <Badge className={isWindowOpen ? 'bg-green-500' : 'bg-red-500'}>
          {isWindowOpen ? 'Open' : 'Closed'}
        </Badge>
      </div>

      {isDraft && isWindowOpen && (
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
            mainAreas={mainAreas}
            submissionWindowId={proposal.submissionWindowId}
            centreCode={proposal.centreCode}
            isEditing={false}
            readOnly={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
