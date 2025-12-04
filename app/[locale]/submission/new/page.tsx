import { requirePermissionGuard } from '@/lib/auth-guard';
import { getCurrentWindow, getMainAreas, getProposalCountByMainArea } from '@/lib/services/submission';
import { redirect } from 'next/navigation';
import { ProposalForm } from '../components/proposal-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import { ArrowLeft } from 'lucide-react';

export default async function NewProposalPage() {
  const session = await requirePermissionGuard('SUBMISSION');

  const currentWindow = await getCurrentWindow();
  const mainAreas = await getMainAreas();

  // Redirect if no open window
  if (!currentWindow || currentWindow.status !== 'OPEN') {
    redirect('/submission');
  }

  // Check if user already has a submission in this window
  const { getProposalsByPi } = await import('@/lib/services/submission');
  const proposals = await getProposalsByPi(session.user.id);
  const existingInWindow = proposals.find(
    (p) => p.submissionWindowId === currentWindow.id && p.status !== 'DRAFT'
  );

  if (existingInWindow) {
    redirect('/submission');
  }

  // Get proposal counts for each main area
  const proposalCounts: Record<string, number> = {};
  for (const area of mainAreas) {
    const count = await getProposalCountByMainArea(currentWindow.id, area.id);
    proposalCounts[area.id] = count;
  }

  if (!session.user.centreId) {
    return (
      <div className='container mx-auto py-8 max-w-4xl'>
        <Card className='border-destructive'>
          <CardHeader>
            <CardTitle className='text-destructive'>Centre Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your account does not have a centre assigned. Please contact an administrator to set up your centre before submitting proposals.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 max-w-4xl'>
      <div className='mb-6'>
        <Link href='/submission'>
          <Button variant='ghost' size='sm' className='mb-4'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to proposals
          </Button>
        </Link>
        <h1 className='text-3xl font-bold mb-2'>New Proposal of Ancillary Study</h1>
        <p className='text-muted-foreground'>
          Submit a new proposal for {currentWindow.name}
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <ProposalForm
            mainAreas={mainAreas}
            submissionWindowId={currentWindow.id}
            centreId={session.user.centreId}
            proposalCounts={proposalCounts}
          />
        </CardContent>
      </Card>
    </div>
  );
}
