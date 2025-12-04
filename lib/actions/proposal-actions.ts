'use server';

import { submissionAction } from './safe-action';
import { proposalFormSchema } from '../schemas/proposal';
import * as submissionService from '../services/submission';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '../prisma';

export const createProposalAction = submissionAction
  .schema(proposalFormSchema.extend({
    submissionWindowId: z.string(),
    centreId: z.string()
  }))
  .action(async ({ parsedInput, ctx }) => {
    // Get user's centreId from database to ensure it comes from server
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { centreId: true }
    });

    if (!user?.centreId) {
      throw new Error('User does not have a centre assigned');
    }

    const proposal = await submissionService.createProposal({
      ...parsedInput,
      piUserId: ctx.userId,
      centreId: user.centreId
    });

    revalidatePath('/submission');
    return { success: true, proposalId: proposal.id };
  });

export const updateProposalAction = submissionAction
  .schema(proposalFormSchema.extend({
    id: z.string()
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...data } = parsedInput;

    // Verify ownership
    const proposal = await submissionService.getProposal(id);
    if (!proposal || proposal.piUserId !== ctx.userId) {
      throw new Error('Unauthorized');
    }

    await submissionService.updateProposal(id, data);

    revalidatePath(`/submission/${id}`);
    revalidatePath('/submission');
    return { success: true };
  });

export const submitProposalAction = submissionAction
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    // Verify ownership
    const proposal = await submissionService.getProposal(parsedInput.id);
    if (!proposal || proposal.piUserId !== ctx.userId) {
      throw new Error('Unauthorized');
    }

    await submissionService.submitProposal(parsedInput.id);

    revalidatePath('/submission');
    revalidatePath(`/submission/${parsedInput.id}`);
    return { success: true };
  });

export const createAndSubmitProposalAction = submissionAction
  .schema(proposalFormSchema.extend({
    submissionWindowId: z.string(),
    centreId: z.string()
  }))
  .action(async ({ parsedInput, ctx }) => {
    // Get user's centreId from database to ensure it comes from server
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { centreId: true }
    });

    if (!user?.centreId) {
      throw new Error('User does not have a centre assigned');
    }

    const proposal = await submissionService.createProposal({
      ...parsedInput,
      piUserId: ctx.userId,
      centreId: user.centreId
    });

    await submissionService.submitProposal(proposal.id);

    revalidatePath('/submission');
    return { success: true, proposalId: proposal.id };
  });

export const updateAndSubmitProposalAction = submissionAction
  .schema(proposalFormSchema.extend({
    id: z.string()
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...data } = parsedInput;

    // Verify ownership
    const proposal = await submissionService.getProposal(id);
    if (!proposal || proposal.piUserId !== ctx.userId) {
      throw new Error('Unauthorized');
    }

    await submissionService.updateProposal(id, data);
    await submissionService.submitProposal(id);

    revalidatePath(`/submission/${id}`);
    revalidatePath('/submission');
    return { success: true };
  });

export const deleteProposalAction = submissionAction
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    // Verify ownership
    const proposal = await submissionService.getProposal(parsedInput.id);
    if (!proposal || proposal.piUserId !== ctx.userId) {
      throw new Error('Unauthorized');
    }

    await submissionService.deleteProposal(parsedInput.id);

    revalidatePath('/submission');
    return { success: true };
  });
