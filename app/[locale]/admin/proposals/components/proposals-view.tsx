'use client';

import { useState, useMemo } from 'react';
import { ProposalsFilters } from './proposals-filters';
import { ProposalsTable } from './proposals-table';
import type { ProposalStatus } from '@prisma/client';

interface Proposal {
  id: string;
  title: string;
  centreCode: string;
  status: ProposalStatus;
  submittedAt: Date | null;
  secondaryTopics: string[];
  piUser: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    centreCode: string | null;
  };
  mainArea: {
    id: string;
    label: string;
  };
  submissionWindow: {
    id: string;
    name: string;
    status: string;
  };
  reviews: {
    id: string;
    decision: string | null;
    status: string;
  }[];
}

interface ProposalsViewProps {
  proposals: Proposal[];
  mainAreas: { id: string; label: string }[];
  windows: { id: string; name: string }[];
}

export function ProposalsView({ proposals, mainAreas, windows }: ProposalsViewProps) {
  const [filters, setFilters] = useState<{
    mainAreaId: string | null;
    windowId: string | null;
    centreCode: string | null;
  }>({
    mainAreaId: null,
    windowId: null,
    centreCode: null
  });

  const centres = useMemo(() => {
    const uniqueCentres = new Set<string>();
    proposals.forEach((proposal) => {
      if (proposal.centreCode) {
        uniqueCentres.add(proposal.centreCode);
      }
    });
    return Array.from(uniqueCentres).sort();
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      if (filters.mainAreaId && proposal.mainArea.id !== filters.mainAreaId) {
        return false;
      }
      if (filters.windowId && proposal.submissionWindow.id !== filters.windowId) {
        return false;
      }
      if (filters.centreCode && proposal.centreCode !== filters.centreCode) {
        return false;
      }
      return true;
    });
  }, [proposals, filters]);

  return (
    <>
      <ProposalsFilters
        mainAreas={mainAreas}
        windows={windows}
        centres={centres}
        onFilterChange={setFilters}
      />
      <ProposalsTable proposals={filteredProposals} />
    </>
  );
}
