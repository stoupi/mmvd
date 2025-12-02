import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/app/i18n/navigation';
import type { Proposal, ProposalStatus, SubmissionWindow, MainArea, Review } from '@/app/generated/prisma';
import { FileText, Calendar, Users } from 'lucide-react';

interface ProposalWithRelations extends Proposal {
  submissionWindow: SubmissionWindow;
  mainArea: MainArea;
  reviews: Review[];
}

interface ProposalListProps {
  proposals: ProposalWithRelations[];
}

const statusColors: Record<ProposalStatus, string> = {
  DRAFT: 'bg-gray-500',
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-yellow-500',
  ACCEPTED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  PRIORITIZED: 'bg-purple-500'
};

const statusLabels: Record<ProposalStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  PRIORITIZED: 'Prioritized'
};

export function ProposalList({ proposals }: ProposalListProps) {
  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className='py-12 text-center text-muted-foreground'>
          <FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
          <p>No proposals yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {proposals.map((proposal) => (
        <Card key={proposal.id} className='hover:shadow-md transition-shadow'>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <CardTitle className='text-lg mb-2'>{proposal.title}</CardTitle>
                <div className='flex flex-wrap gap-2 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-1'>
                    <FileText className='h-4 w-4' />
                    <span>{proposal.mainArea.label}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-4 w-4' />
                    <span>{proposal.submissionWindow.name}</span>
                  </div>
                  {proposal.reviews.length > 0 && (
                    <div className='flex items-center gap-1'>
                      <Users className='h-4 w-4' />
                      <span>{proposal.reviews.length} review(s)</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge className={statusColors[proposal.status]}>
                {statusLabels[proposal.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-muted-foreground'>
                {proposal.submittedAt ? (
                  <span>
                    Submitted: {new Date(proposal.submittedAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span>Created: {new Date(proposal.createdAt).toLocaleDateString()}</span>
                )}
              </div>
              <div className='flex gap-2'>
                {proposal.status === 'DRAFT' && (
                  <Link href={`/submission/${proposal.id}/edit`}>
                    <Button size='sm' variant='outline'>
                      Edit Draft
                    </Button>
                  </Link>
                )}
                <Link href={`/submission/${proposal.id}`}>
                  <Button size='sm' variant='default'>
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
