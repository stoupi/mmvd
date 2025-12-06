import { requirePermissionGuard } from '@/lib/auth-guard';
import { getTypedSession } from '@/lib/auth-helpers';
import { getProposal, getMainAreas } from '@/lib/services/submission';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { ReviewForm } from './components/review-form';
import { ProposalForm } from '@/app/[locale]/submission/components/proposal-form';

export default async function ReviewProposalPage({
  params
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  await requirePermissionGuard('REVIEWING');
  const session = await getTypedSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  const proposal = await getProposal(proposalId);

  if (!proposal) {
    notFound();
  }

  // Find the review for this reviewer and proposal
  const review = proposal.reviews?.find((r: any) => r.reviewerId === session.user.id);

  if (!review) {
    redirect('/reviewing');
  }

  // Verify it's not a draft assignment
  if (review.isDraft) {
    redirect('/reviewing');
  }

  const mainAreas = await getMainAreas();
  const isCompleted = review.status === 'COMPLETED';

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
        <Link href='/reviewing'>
          <Button variant='outline' size='sm' className='mb-4'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Proposals
          </Button>
        </Link>

        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-3xl font-bold'>Review Proposal</h1>
          {isCompleted && (
            <Badge className='bg-green-600'>Review Completed</Badge>
          )}
        </div>

        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Calendar className='h-4 w-4' />
              <span>Review Deadline:</span>
              <span className='font-medium text-red-600'>
                {new Date(review.deadline).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6'>
        {/* Proposal Form in read-only mode */}
        <ProposalForm
          initialData={initialData}
          mainAreas={mainAreas}
          submissionWindowId={proposal.submissionWindowId}
          centreId={proposal.centreId}
          readOnly={true}
        />

        {/* Review Form */}
        <ReviewForm reviewId={review.id} isCompleted={isCompleted} />
      </div>
    </div>
  );
}
