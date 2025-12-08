'use server';

import { z } from 'zod';
import { authenticatedAction } from './safe-action';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const updateProposalStatusSchema = z.object({
  proposalId: z.string(),
  status: z.enum(['ACCEPTED', 'REJECTED', 'REVISION_REQUIRED', 'UNDER_REVIEW', 'PRIORITIZED'])
});

export const updateProposalStatusAction = authenticatedAction
  .schema(updateProposalStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { proposalId, status } = parsedInput;

    // Verify user is admin
    if (!ctx.session.user.permissions.includes('ADMIN')) {
      throw new Error('Unauthorized: Admin permission required');
    }

    // Verify proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        reviews: {
          where: {
            isDeleted: false,
            isDraft: false,
            status: 'COMPLETED'
          }
        }
      }
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Verify at least one review is completed before making a decision
    if (proposal.reviews.length === 0) {
      throw new Error('Cannot update status without any completed reviews');
    }

    // Update the proposal status
    await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status
      }
    });

    revalidatePath('/admin');
    revalidatePath(`/admin/proposals/${proposalId}`);
    revalidatePath('/submission');

    return { success: true };
  });
