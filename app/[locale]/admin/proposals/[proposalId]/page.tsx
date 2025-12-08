import { requirePermissionGuard } from '@/lib/auth-guard';
import { getAdminProposalDetails } from '@/lib/services/admin';
import { getMainAreas } from '@/lib/services/submission';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import { ArrowLeft, User, Calendar, Building2, FileDown } from 'lucide-react';
import { ProposalForm } from '@/app/[locale]/submission/components/proposal-form';
import { ExportProposalButton } from '../components/export-proposal-button';
import { WindowStatusBadge } from '@/components/window-status-badge';
import { ReviewsSummary } from './components/reviews-summary';
import { AdminDecisionForm } from './components/admin-decision-form';

const statusColors = {
  DRAFT: 'bg-gray-500',
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-yellow-500',
  REVISION_REQUIRED: 'bg-orange-500',
  RESUBMITTED: 'bg-indigo-500',
  ACCEPTED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  PRIORITIZED: 'bg-purple-500'
};

const statusLabels = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  REVISION_REQUIRED: 'Revision Required',
  RESUBMITTED: 'Resubmitted',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  PRIORITIZED: 'Prioritized'
};

export default async function AdminProposalDetailPage({
  params
}: {
  params: Promise<{ proposalId: string }>;
}) {
  const { proposalId } = await params;
  await requirePermissionGuard('ADMIN');

  const proposal = await getAdminProposalDetails(proposalId);

  if (!proposal) {
    notFound();
  }

  const mainAreas = await getMainAreas();

  const piName = proposal.piUser.firstName && proposal.piUser.lastName
    ? `${proposal.piUser.firstName} ${proposal.piUser.lastName}`
    : proposal.piUser.email;

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
      <Link href='/admin'>
        <Button variant='ghost' size='sm' className='mb-4'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to proposals
        </Button>
      </Link>

      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <h1 className='text-3xl font-bold'>Proposal Details</h1>
          <Badge className={statusColors[proposal.status]}>
            {statusLabels[proposal.status]}
          </Badge>
        </div>
        <div className='flex gap-2'>
          <ExportProposalButton
            proposal={{
              title: proposal.title,
              centreCode: proposal.centre?.code || 'N/A',
              piName,
              piEmail: proposal.piUser.email,
              affiliation: proposal.piUser.affiliation || undefined,
              submissionWindow: proposal.submissionWindow.name,
              mainTopic: proposal.mainArea.label,
              secondaryTopics: proposal.secondaryTopics,
              scientificBackground: proposal.scientificBackground,
              literaturePosition: proposal.literaturePosition || undefined,
              competingWork: proposal.competingWork as any[],
              primaryObjective: proposal.primaryObjective,
              secondaryObjectives: proposal.secondaryObjectives,
              mainExposure: proposal.mainExposure,
              primaryEndpoint: proposal.primaryEndpoint,
              secondaryEndpoints: proposal.secondaryEndpoints,
              studyPopulation: proposal.studyPopulation,
              inclusionCriteria: proposal.inclusionCriteria || undefined,
              exclusionCriteria: proposal.exclusionCriteria || undefined,
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
              analysisTypes: proposal.analysisTypes as string[],
              analysisDescription: proposal.analysisDescription || undefined,
              adjustmentCovariates: proposal.adjustmentCovariates || undefined,
              subgroupAnalyses: proposal.subgroupAnalyses || undefined,
              targetJournals: proposal.targetJournals,
              submittedAt: proposal.submittedAt
            }}
          />
          {proposal.status === 'SUBMITTED' && (
            <a href={`/api/proposals/${proposalId}/export-pdf`} download>
              <Button variant='outline'>
                <FileDown className='h-4 w-4 mr-2' />
                Export to PDF
              </Button>
            </a>
          )}
        </div>
      </div>

      <Card className='mb-6 bg-gray-50'>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm text-muted-foreground'>Principal Investigator</p>
                <p className='font-medium'>{piName}</p>
                <p className='text-sm text-muted-foreground'>{proposal.piUser.email}</p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Building2 className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm text-muted-foreground'>Centre</p>
                <p className='font-medium'>{proposal.centre?.code || 'N/A'}</p>
                {proposal.centre?.name && (
                  <p className='text-sm text-muted-foreground'>{proposal.centre.name}</p>
                )}
                {proposal.piUser.affiliation && (
                  <p className='text-sm text-muted-foreground'>{proposal.piUser.affiliation}</p>
                )}
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm text-muted-foreground'>Submission Window</p>
                <p className='font-medium'>{proposal.submissionWindow.name}</p>
                <WindowStatusBadge status={proposal.submissionWindow.status} />
              </div>
            </div>
            {proposal.submittedAt && (
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm text-muted-foreground'>Submitted</p>
                  <p className='font-medium'>
                    {new Date(proposal.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Summary */}
      {proposal.reviews && proposal.reviews.length > 0 && (
        <div className='mb-6'>
          <ReviewsSummary reviews={proposal.reviews} />
        </div>
      )}

      {/* Admin Decision Form */}
      <div className='mb-6'>
        <AdminDecisionForm
          proposalId={proposalId}
          currentStatus={proposal.status}
          reviewCount={proposal.reviews?.length || 0}
          completedReviewCount={
            proposal.reviews?.filter((r) => r.status === 'COMPLETED' && !r.isDraft).length || 0
          }
        />
      </div>

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
