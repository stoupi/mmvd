'use server';

import { z } from 'zod';
import { authenticatedAction } from './safe-action';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const saveReviewDraftSchema = z.object({
  reviewId: z.string(),
  // Quick questions
  aimClear: z.boolean().optional(),
  aimOriginal: z.boolean().optional(),
  feasible: z.boolean().optional(),
  rationaleWell: z.boolean().optional(),
  literatureReviewed: z.boolean().optional(),
  exposureDefined: z.boolean().optional(),
  endpointIdentified: z.boolean().optional(),
  endpointMeaningful: z.boolean().optional(),
  statisticalPlanCoherent: z.boolean().optional(),
  wellWritten: z.boolean().optional(),
  // Detailed comments
  generalComments: z.string().optional(),
  statisticalComments: z.string().optional(),
  modificationsRequired: z.string().optional(),
  // Decision
  decision: z.enum(['ACCEPT', 'REJECT', 'REVISE']).optional()
});

const submitReviewSchema = z.object({
  reviewId: z.string(),
  // Quick questions (all required)
  aimClear: z.boolean(),
  aimOriginal: z.boolean(),
  feasible: z.boolean(),
  rationaleWell: z.boolean(),
  literatureReviewed: z.boolean(),
  exposureDefined: z.boolean(),
  endpointIdentified: z.boolean(),
  endpointMeaningful: z.boolean(),
  statisticalPlanCoherent: z.boolean(),
  wellWritten: z.boolean(),
  // Detailed comments (all required)
  generalComments: z.string().min(1, 'General comments are required'),
  statisticalComments: z.string().min(1, 'Statistical comments are required'),
  modificationsRequired: z.string().min(1, 'Modifications required are required'),
  // Decision (required)
  decision: z.enum(['ACCEPT', 'REJECT', 'REVISE'])
});

export const saveReviewDraftAction = authenticatedAction
  .schema(saveReviewDraftSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { reviewId, ...data } = parsedInput;

    // Verify the review belongs to the user
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.reviewerId !== ctx.session.user.id) {
      throw new Error('Unauthorized access to this review');
    }

    if (review.isDraft) {
      throw new Error('Cannot save draft for unvalidated assignment');
    }

    if (review.status === 'COMPLETED') {
      throw new Error('This review has already been submitted');
    }

    // Update the review
    await prisma.review.update({
      where: { id: reviewId },
      data
    });

    revalidatePath('/reviewing');
    revalidatePath(`/reviewing/${review.proposalId}`);

    return { success: true };
  });

export const submitReviewAction = authenticatedAction
  .schema(submitReviewSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { reviewId, ...data } = parsedInput;

    // Verify the review belongs to the user
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.reviewerId !== ctx.session.user.id) {
      throw new Error('Unauthorized access to this review');
    }

    if (review.isDraft) {
      throw new Error('Cannot submit draft review');
    }

    if (review.status === 'COMPLETED') {
      throw new Error('This review has already been submitted');
    }

    // Check if deadline has passed
    const isLate = new Date() > new Date(review.deadline);

    // Update the review
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...data,
        status: 'COMPLETED',
        completedAt: new Date(),
        isLate
      }
    });

    revalidatePath('/reviewing');
    revalidatePath(`/reviewing/${review.proposalId}`);

    return { success: true };
  });
