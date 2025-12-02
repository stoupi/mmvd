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
    background: proposal.background,
    objectives: proposal.objectives,
    methods: proposal.methods,
    statisticalAnalysis: proposal.statisticalAnalysis,
    expectedImpact: proposal.expectedImpact || '',
    references: proposal.references || '',
    nPatients: proposal.nPatients || undefined,
    statisticianName: proposal.statisticianName || ''
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
