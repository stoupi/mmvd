'use server';

import { submissionAction } from './safe-action';
import { proposalFormSchema } from '../schemas/proposal';
import * as submissionService from '../services/submission';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '../prisma';

// Draft schema with all fields optional (for saving incomplete proposals)
const draftProposalSchema = z.object({
  title: z.string().optional(),
  mainAreaId: z.string().optional(),
  secondaryTopics: z.array(z.string()).optional(),
  scientificBackground: z.string().optional(),
  literaturePosition: z.string().optional(),
  competingWork: z.array(z.object({
    doi: z.string().optional(),
    pmid: z.string().optional(),
    journal: z.string().optional(),
    nPatients: z.number().optional()
  })).optional(),
  primaryObjective: z.string().optional(),
  secondaryObjectives: z.array(z.string()).optional(),
  mainExposure: z.string().optional(),
  primaryEndpoint: z.string().optional(),
  secondaryEndpoints: z.array(z.string()).optional(),
  studyPopulation: z.string().optional(),
  inclusionCriteria: z.string().optional(),
  exclusionCriteria: z.string().optional(),
  dataBaseline: z.boolean().optional(),
  dataBiological: z.boolean().optional(),
  dataTTE: z.boolean().optional(),
  dataTOE: z.boolean().optional(),
  dataStressEcho: z.boolean().optional(),
  dataCMR: z.boolean().optional(),
  dataCT: z.boolean().optional(),
  dataRHC: z.boolean().optional(),
  dataHospitalFollowup: z.boolean().optional(),
  dataClinicalFollowup: z.boolean().optional(),
  dataTTEFollowup: z.boolean().optional(),
  dataCoreLab: z.boolean().optional(),
  analysisTypes: z.array(z.enum(['logistic', 'cox', 'propensity', 'ml'])).optional(),
  analysisDescription: z.string().optional(),
  adjustmentCovariates: z.string().optional(),
  subgroupAnalyses: z.string().optional(),
  targetJournals: z.array(z.string()).optional(),
  submissionWindowId: z.string(),
  centreId: z.string()
});

export const saveDraftAction = submissionAction
  .schema(draftProposalSchema)
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

export const updateDraftAction = submissionAction
  .schema(draftProposalSchema.extend({
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
    return { success: true, proposalId: id };
  });

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
