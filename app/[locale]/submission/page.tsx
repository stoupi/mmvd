import { requirePermissionGuard } from '@/lib/auth-guard';
import { getCurrentWindow, getProposalsByPi } from '@/lib/services/submission';
import { getTranslations } from 'next-intl/server';
import { ProposalsSection } from './components/proposals-section';
import { CurrentWindowProposals } from './components/current-window-proposals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/app/i18n/navigation';
import { Plus, Calendar, Clock } from 'lucide-react';

export default async function SubmissionPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requirePermissionGuard('SUBMISSION');
  const t = await getTranslations({ locale, namespace: 'submission' });

  const currentWindow = await getCurrentWindow();
  const proposals = await getProposalsByPi(session.user.id);

  // Separate proposals by current window and closed windows
  const currentWindowProposals = currentWindow
    ? proposals.filter(proposal => proposal.submissionWindowId === currentWindow.id)
    : [];

  const closedWindowsProposals = currentWindow
    ? proposals.filter(proposal => proposal.submissionWindowId !== currentWindow.id)
    : proposals;

  const hasSubmittedInCurrentWindow = currentWindowProposals.some(
    proposal => proposal.status !== 'DRAFT'
  );

  const canCreateNew =
    currentWindow?.status === 'OPEN' &&
    !hasSubmittedInCurrentWindow;

  const daysRemaining = currentWindow
    ? Math.ceil((new Date(currentWindow.submissionCloseAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const userName = [
    session.user.title,
    session.user.firstName,
    session.user.lastName
  ].filter(Boolean).join(' ');

  return (
    <div className='container mx-auto py-8 max-w-7xl px-4'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold mb-2'>
          Welcome, {userName || session.user.name || session.user.email}
        </h1>
        <p className='text-muted-foreground'>
          Submit and manage your research proposals
        </p>
      </div>

      <div className='grid gap-8'>
        {currentWindow && (
          <Card>
            <CardHeader>
              <CardTitle>Current Window</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='flex flex-wrap items-center gap-3'>
                  <Badge className={currentWindow.status === 'OPEN' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                    {currentWindow.status === 'OPEN' ? 'Submission Window Open' : 'Submission Window Closed'}
                  </Badge>
                  <span className='text-lg font-semibold'>{currentWindow.name}</span>
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <Calendar className='h-4 w-4' />
                    <span>
                      {new Date(currentWindow.submissionOpenAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {' - '}
                      {new Date(currentWindow.submissionCloseAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {currentWindow.status === 'OPEN' && (
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-pink-600' />
                      <span className='font-semibold text-pink-600'>
                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                      </span>
                    </div>
                  )}
                </div>

                {canCreateNew && (
                  <Link href='/submission/new'>
                    <Button size='lg' className='transition-all hover:scale-105'>
                      <Plus className='h-5 w-5 mr-2' />
                      Create New Proposal
                    </Button>
                  </Link>
                )}
              </div>

              {hasSubmittedInCurrentWindow && (
                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <h4 className='font-semibold text-green-900 mb-1'>
                    {t('alreadySubmitted')}
                  </h4>
                  <p className='text-sm text-green-700'>{t('alreadySubmittedMessage')}</p>
                </div>
              )}

              {currentWindow.status !== 'OPEN' && (
                <div className='bg-muted rounded-lg p-4'>
                  <p className='text-sm text-muted-foreground'>
                    The submission window is currently closed.
                  </p>
                </div>
              )}

              <div className='pt-4'>
                <h3 className='text-lg font-semibold mb-4'>Proposals for this window</h3>
                <CurrentWindowProposals
                  proposals={currentWindowProposals}
                  windowStatus={currentWindow.status}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {!currentWindow && (
          <Card>
            <CardHeader>
              <CardTitle>Current Window</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='bg-muted rounded-lg p-6 text-center'>
                <p className='text-muted-foreground'>{t('noActiveWindow')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {closedWindowsProposals.length > 0 ? (
          <ProposalsSection proposals={closedWindowsProposals} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>My Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12 text-muted-foreground'>
                <p>No proposals from previous windows</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
