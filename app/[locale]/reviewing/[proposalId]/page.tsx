import { requirePermissionGuard } from '@/lib/auth-guard';
import { getTypedSession } from '@/lib/auth-helpers';
import { getProposal, getCategoriesWithTopics } from '@/lib/services/submission';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import { ArrowLeft, Calendar, Building2, User, FileText } from 'lucide-react';
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

  const categoriesWithTopics = await getCategoriesWithTopics();
  const isCompleted = review.status === 'COMPLETED';

  // Format PI name
  const piName =
    proposal.piUser.firstName && proposal.piUser.lastName
      ? `${proposal.piUser.firstName} ${proposal.piUser.lastName}`
      : proposal.piUser.email;

  // Format centre
  const centreInfo = proposal.centre
    ? `${proposal.centre.code} - ${proposal.centre.name}`
    : 'N/A';

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

        <Card className='mb-6 bg-gray-50'>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-center gap-2'>
                <FileText className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>Submission Window</p>
                  <p className='font-medium'>{proposal.submissionWindow.name}</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>Submitted On</p>
                  <p className='font-medium'>
                    {proposal.submittedAt
                      ? new Date(proposal.submittedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Building2 className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>Centre</p>
                  <p className='font-medium'>{centreInfo}</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <User className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>Principal Investigator</p>
                  <p className='font-medium'>{piName}</p>
                  <p className='text-sm text-muted-foreground'>{proposal.piUser.email}</p>
                </div>
              </div>

              <div className='flex items-center gap-2 md:col-span-2 pt-2 border-t'>
                <Calendar className='h-4 w-4 text-red-600' />
                <div>
                  <p className='text-sm text-muted-foreground'>Review Deadline</p>
                  <p className='font-medium text-red-600'>
                    {new Date(review.deadline).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6'>
        {/* Proposal Form in read-only mode */}
        <ProposalForm
          initialData={initialData}
          categoriesWithTopics={categoriesWithTopics}
          proposalCounts={{}}
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
