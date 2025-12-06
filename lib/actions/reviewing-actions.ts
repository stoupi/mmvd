'use server';

import { revalidatePath } from 'next/cache';
import { adminAction, reviewingAction } from './safe-action';
import * as reviewingService from '@/lib/services/reviewing';
import * as schemas from '@/lib/schemas/reviewing';

// Admin Actions - Draft Assignment Management
export const createDraftAssignmentAction = adminAction
  .schema(schemas.createDraftAssignmentSchema)
  .action(async ({ parsedInput }) => {
    const review = await reviewingService.createDraftAssignment(parsedInput);
    revalidatePath('/admin/reviewing');
    revalidatePath('/admin');
    return { success: true, review };
  });

export const updateDraftAssignmentAction = adminAction
  .schema(schemas.updateDraftAssignmentSchema)
  .action(async ({ parsedInput }) => {
    const { reviewId, ...data } = parsedInput;
    const review = await reviewingService.updateDraftAssignment(reviewId, data);
    revalidatePath('/admin/reviewing');
    revalidatePath('/admin');
    return { success: true, review };
  });

export const removeDraftAssignmentAction = adminAction
  .schema(schemas.removeDraftAssignmentSchema)
  .action(async ({ parsedInput }) => {
    await reviewingService.removeDraftAssignment(parsedInput.reviewId);
    revalidatePath('/admin/reviewing');
    revalidatePath('/admin');
    return { success: true };
  });

// Admin Actions - Validation & Email
export const validateAssignmentsAction = adminAction
  .schema(schemas.validateAssignmentsSchema)
  .action(async ({ parsedInput }) => {
    const result = await reviewingService.validateAssignments(parsedInput.windowId);
    revalidatePath('/admin/reviewing');
    revalidatePath('/admin');
    revalidatePath('/reviewing');
    return { success: true, ...result };
  });

export const resendReviewerEmailAction = adminAction
  .schema(schemas.resendReviewerEmailSchema)
  .action(async ({ parsedInput }) => {
    await reviewingService.resendReviewerEmail(parsedInput.reviewId);
    revalidatePath('/admin/reviewing');
    return { success: true };
  });

export const sendEmailToReviewerAction = adminAction
  .schema(schemas.sendEmailToReviewerSchema)
  .action(async ({ parsedInput }) => {
    const result = await reviewingService.sendEmailToReviewer(
      parsedInput.reviewerId,
      parsedInput.windowId
    );
    revalidatePath('/admin/reviewing');
    revalidatePath(`/admin/reviewing/${parsedInput.windowId}`);
    revalidatePath('/reviewing');
    return { success: true, ...result };
  });

export const validateAndSendAllEmailsAction = adminAction
  .schema(schemas.validateAndSendAllEmailsSchema)
  .action(async ({ parsedInput }) => {
    const result = await reviewingService.validateAndSendAllEmailsForWindow(parsedInput.windowId);
    revalidatePath('/admin/reviewing');
    revalidatePath(`/admin/reviewing/${parsedInput.windowId}`);
    revalidatePath('/reviewing');
    return { success: true, ...result };
  });

// Reviewer Actions - Review Submission
export const submitReviewAction = reviewingAction
  .schema(schemas.submitReviewSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { reviewId, ...data } = parsedInput;

    // Verify that the review belongs to the current reviewer
    const review = await reviewingService.getReviewById(reviewId, ctx.userId);

    // Submit the review
    const updatedReview = await reviewingService.submitReview(reviewId, data);

    revalidatePath('/reviewing');
    revalidatePath(`/reviewing/${reviewId}`);
    return { success: true, review: updatedReview };
  });
