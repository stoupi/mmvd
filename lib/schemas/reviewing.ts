import { z } from 'zod';
import { ReviewDecision, OverlapAssessment } from '@/app/generated/prisma';

// Draft Assignment Schemas
export const createDraftAssignmentSchema = z.object({
  proposalId: z.string().min(1, 'Proposal ID is required'),
  reviewerId: z.string().min(1, 'Reviewer ID is required'),
  deadline: z.coerce.date()
});

export const updateDraftAssignmentSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  deadline: z.coerce.date()
});

export const removeDraftAssignmentSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required')
});

// Validation & Email Schemas
export const validateAssignmentsSchema = z.object({
  windowId: z.string().min(1, 'Window ID is required')
});

export const resendReviewerEmailSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required')
});

// Review Submission Schema
export const submitReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  decision: z.nativeEnum(ReviewDecision, {
    errorMap: () => ({ message: 'Please select a decision' })
  }),
  overlap: z.nativeEnum(OverlapAssessment, {
    errorMap: () => ({ message: 'Please select an overlap assessment' })
  }),
  overlapDetails: z.string().optional(),
  commentsForPI: z.string().optional(),
  commentsForAdmin: z.string().optional()
}).refine(
  (data) => {
    // If overlap is PARTIAL or MAJOR, overlapDetails is required
    if (data.overlap === 'PARTIAL' || data.overlap === 'MAJOR') {
      return data.overlapDetails && data.overlapDetails.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Overlap details are required when overlap is Partial or Major',
    path: ['overlapDetails']
  }
);
