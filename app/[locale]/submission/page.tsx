import { requirePermissionGuard } from '@/lib/auth-guard';
import { getCurrentWindow, getProposalsByPi } from '@/lib/services/submission';
import { getTranslations } from 'next-intl/server';
import { ProposalList } from './components/proposal-list';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import { Plus } from 'lucide-react';

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

  // Check if user has already submitted in current window
  const hasSubmittedInCurrentWindow = currentWindow
    ? proposals.some(
        (p) =>
          p.submissionWindowId === currentWindow.id &&
          p.status !== 'DRAFT'
      )
    : false;

  // Check if user has a draft in current window
  const draftInCurrentWindow = currentWindow
    ? proposals.find(
        (p) =>
          p.submissionWindowId === currentWindow.id &&
          p.status === 'DRAFT'
      )
    : null;

  const canCreateNew =
    currentWindow?.status === 'OPEN' &&
    !hasSubmittedInCurrentWindow &&
    !draftInCurrentWindow;

  const daysRemaining = currentWindow
    ? Math.ceil((new Date(currentWindow.submissionCloseAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className='container mx-auto py-8 max-w-6xl'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-6'>{t('title')}</h1>
        {currentWindow && (
          <p className='text-lg text-black text-center' style={{ fontFamily: 'Georgia, serif' }}>
            The submission window is open from{' '}
            <strong>
              {new Date(currentWindow.submissionOpenAt).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              })}
            </strong>{' '}
            to{' '}
            <strong>
              {new Date(currentWindow.submissionCloseAt).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              })}
            </strong>{' '}
            (<strong>{daysRemaining}</strong> {daysRemaining === 1 ? 'day' : 'days'} remaining).
          </p>
        )}
        {!currentWindow && (
          <p className='text-center text-muted-foreground'>{t('noActiveWindow')}</p>
        )}
      </div>

      {canCreateNew && (
        <div className='mb-6'>
          <Link href='/submission/new'>
            <Button size='lg'>
              <Plus className='h-5 w-5 mr-2' />
              {t('newProposal')}
            </Button>
          </Link>
        </div>
      )}

      {draftInCurrentWindow && (
        <div className='bg-blue-50 border-l-4 border-blue-600 p-6 mb-6'>
          <h3 className='font-semibold text-blue-900 mb-2'>
            {t('draftInProgress')}
          </h3>
          <p className='text-blue-700 mb-4'>{t('draftMessage')}</p>
          <Link href={`/submission/${draftInCurrentWindow.id}/edit`}>
            <Button variant='outline'>{t('continueDraft')}</Button>
          </Link>
        </div>
      )}

      {hasSubmittedInCurrentWindow && currentWindow && (
        <div className='bg-green-50 border-l-4 border-green-600 p-6 mb-6'>
          <h3 className='font-semibold text-green-900 mb-2'>
            {t('alreadySubmitted')}
          </h3>
          <p className='text-green-700'>{t('alreadySubmittedMessage')}</p>
        </div>
      )}

      <div className='mt-8'>
        <h2 className='text-2xl font-semibold mb-4'>{t('yourProposals')}</h2>
        <ProposalList proposals={proposals} />
      </div>
    </div>
  );
}
