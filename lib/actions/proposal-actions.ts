'use server';

import { submissionAction } from './safe-action';
import { proposalFormSchema } from '../schemas/proposal';
import * as submissionService from '../services/submission';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export const createProposalAction = submissionAction
  .schema(proposalFormSchema.extend({
    submissionWindowId: z.string(),
    centreCode: z.string()
  }))
  .action(async ({ parsedInput, ctx }) => {
    const proposal = await submissionService.createProposal({
      ...parsedInput,
      piUserId: ctx.userId
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
