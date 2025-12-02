import { prisma } from '@/lib/prisma';
import type { ProposalStatus } from '@/app/generated/prisma';

export async function getCurrentWindow() {
  return prisma.submissionWindow.findFirst({
    where: {
      status: { in: ['OPEN', 'REVIEW', 'RESPONSE'] }
    },
    orderBy: { submissionOpenAt: 'desc' }
  });
}

export async function getProposalsByPi(piUserId: string) {
  return prisma.proposal.findMany({
    where: {
      piUserId,
      isDeleted: false
    },
    include: {
      submissionWindow: true,
      mainArea: true,
      reviews: {
        where: { isDeleted: false }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getProposal(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      submissionWindow: true,
      mainArea: true,
      piUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          centreCode: true
        }
      },
      reviews: {
        where: { isDeleted: false },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }
    }
  });
}

export async function getProposalCountByMainArea(
  submissionWindowId: string,
  mainAreaId: string
) {
  return prisma.proposal.count({
    where: {
      submissionWindowId,
      mainAreaId,
      isDeleted: false,
      status: { not: 'DRAFT' }
    }
  });
}

interface CreateProposalInput {
  title: string;
  submissionWindowId: string;
  mainAreaId: string;
  piUserId: string;
  centreCode: string;
  background: string;
  objectives: string;
  methods: string;
  statisticalAnalysis: string;
  expectedImpact?: string;
  references?: string;
  nPatients?: number;
  statisticianName?: string;
}

export async function createProposal(data: CreateProposalInput) {
  // Validation: one proposal per centre per window
  const existing = await prisma.proposal.findFirst({
    where: {
      submissionWindowId: data.submissionWindowId,
      centreCode: data.centreCode,
      isDeleted: false
    }
  });

  if (existing) {
    throw new Error('A proposal already exists for this centre in this window');
  }

  return prisma.proposal.create({
    data: {
      ...data,
      status: 'DRAFT'
    }
  });
}

interface UpdateProposalInput {
  title?: string;
  mainAreaId?: string;
  background?: string;
  objectives?: string;
  methods?: string;
  statisticalAnalysis?: string;
  expectedImpact?: string;
  references?: string;
  nPatients?: number;
  statisticianName?: string;
}

export async function updateProposal(id: string, data: UpdateProposalInput) {
  // Only allow updates if status is DRAFT
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) {
    throw new Error('Proposal not found');
  }
  if (proposal.status !== 'DRAFT') {
    throw new Error('Cannot edit submitted proposal');
  }

  return prisma.proposal.update({
    where: { id },
    data
  });
}

export async function submitProposal(id: string) {
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) {
    throw new Error('Proposal not found');
  }
  if (proposal.status !== 'DRAFT') {
    throw new Error('Proposal has already been submitted');
  }

  return prisma.proposal.update({
    where: { id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date()
    }
  });
}

export async function deleteProposal(id: string) {
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) {
    throw new Error('Proposal not found');
  }
  if (proposal.status !== 'DRAFT') {
    throw new Error('Cannot delete submitted proposal');
  }

  // Soft delete
  return prisma.proposal.update({
    where: { id },
    data: { isDeleted: true }
  });
}

export async function getMainAreas() {
  return prisma.mainArea.findMany({
    where: { isActive: true },
    orderBy: { label: 'asc' }
  });
}
