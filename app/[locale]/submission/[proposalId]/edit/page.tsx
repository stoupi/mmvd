import { requirePermissionGuard } from '@/lib/auth-guard';
import { getProposal, getMainAreas, getProposalCountByMainArea } from '@/lib/services/submission';
import { redirect, notFound } from 'next/navigation';
import { ProposalForm } from '../../components/proposal-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const mainAreas = await getMainAreas();

  // Get proposal counts for each main area
  const proposalCounts: Record<string, number> = {};
  for (const area of mainAreas) {
    const count = await getProposalCountByMainArea(proposal.submissionWindowId, area.id);
    proposalCounts[area.id] = count;
  }

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
    targetJournals: proposal.targetJournals
  };

  return (
    <div className='container mx-auto py-8 max-w-4xl'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Edit Proposal Draft</h1>
        <p className='text-muted-foreground'>
          {proposal.submissionWindow.name}
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <ProposalForm
            initialData={initialData}
            proposalId={proposalId}
            mainAreas={mainAreas}
            submissionWindowId={proposal.submissionWindowId}
            centreCode={proposal.centreCode}
            isEditing={true}
            proposalCounts={proposalCounts}
          />
        </CardContent>
      </Card>
    </div>
  );
}
