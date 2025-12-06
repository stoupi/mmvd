import { Badge } from '@/components/ui/badge';

interface Proposal {
  title: string;
  mainArea: {
    label: string;
    color: string | null;
  };
  piUser: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  centre: {
    code: string;
    name: string;
  } | null;
  submissionWindow: {
    name: string;
  };
}

interface ProposalDetailsViewProps {
  proposal: Proposal;
}

export function ProposalDetailsView({ proposal }: ProposalDetailsViewProps) {
  const piName =
    proposal.piUser.firstName && proposal.piUser.lastName
      ? `${proposal.piUser.firstName} ${proposal.piUser.lastName}`
      : proposal.piUser.email;

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold mb-1'>{proposal.title}</h3>
        <div className='flex items-center gap-2 mt-2'>
          <span className='text-sm text-muted-foreground'>Main Topic:</span>
          <Badge
            style={{
              backgroundColor: proposal.mainArea.color || '#6b7280'
            }}
          >
            {proposal.mainArea.label}
          </Badge>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-2'>
        <div>
          <p className='text-sm text-muted-foreground'>Principal Investigator</p>
          <p className='font-medium'>{piName}</p>
          <p className='text-sm text-muted-foreground'>{proposal.piUser.email}</p>
        </div>

        <div>
          <p className='text-sm text-muted-foreground'>Centre</p>
          <p className='font-medium'>
            {proposal.centre ? `${proposal.centre.code} - ${proposal.centre.name}` : 'N/A'}
          </p>
        </div>

        <div>
          <p className='text-sm text-muted-foreground'>Submission Window</p>
          <p className='font-medium'>{proposal.submissionWindow.name}</p>
        </div>
      </div>

      <div className='pt-2 border-t'>
        <p className='text-sm text-muted-foreground italic'>
          For full proposal details, please refer to the proposal document provided by the admin.
        </p>
      </div>
    </div>
  );
}
