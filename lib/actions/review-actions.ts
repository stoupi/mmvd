'use server';

import { z } from 'zod';
import { authenticatedAction } from './safe-action';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const saveReviewDraftSchema = z.object({
  reviewId: z.string(),
  decision: z.enum(['ACCEPT', 'REJECT', 'REVISE']).optional(),
  overlap: z.enum(['NO', 'PARTIAL', 'MAJOR']).optional(),
  overlapDetails: z.string().optional(),
  commentsForPI: z.string().optional(),
  commentsForAdmin: z.string().optional()
});

const submitReviewSchema = z.object({
  reviewId: z.string(),
  decision: z.enum(['ACCEPT', 'REJECT', 'REVISE']),
  overlap: z.enum(['NO', 'PARTIAL', 'MAJOR']),
  overlapDetails: z.string().optional(),
  commentsForPI: z.string().min(1, 'Comments for PI are required'),
  commentsForAdmin: z.string().optional()
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
