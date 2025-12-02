import { z } from 'zod';
import { AppPermission, WindowStatus } from '@prisma/client';

// Main Area Schemas
export const mainAreaSchema = z.object({
  label: z.string().min(3, 'Label must be at least 3 characters'),
  description: z.string().optional()
});

export const updateMainAreaSchema = mainAreaSchema.extend({
  id: z.string()
});

export const deleteMainAreaSchema = z.object({
  id: z.string()
});

// User Management Schemas
export const updateUserPermissionsSchema = z.object({
  userId: z.string(),
  permissions: z.array(z.nativeEnum(AppPermission))
});

export const updateUserStatusSchema = z.object({
  userId: z.string(),
  isActive: z.boolean()
});

export const updateUserProfileSchema = z.object({
  userId: z.string(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  affiliation: z.string().optional(),
  centreCode: z.string().optional()
});

// Submission Window Schemas
export const submissionWindowSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  submissionOpenAt: z.coerce.date(),
  submissionCloseAt: z.coerce.date(),
  reviewStartAt: z.coerce.date(),
  reviewDeadlineDefault: z.coerce.date(),
  responseDeadline: z.coerce.date(),
  nextWindowOpensAt: z.coerce.date().optional()
}).refine(
  (data) => data.submissionCloseAt > data.submissionOpenAt,
  {
    message: 'Submission close date must be after open date',
    path: ['submissionCloseAt']
  }
).refine(
  (data) => data.reviewStartAt >= data.submissionCloseAt,
  {
    message: 'Review start must be on or after submission close date',
    path: ['reviewStartAt']
  }
).refine(
  (data) => data.reviewDeadlineDefault > data.reviewStartAt,
  {
    message: 'Review deadline must be after review start date',
    path: ['reviewDeadlineDefault']
  }
).refine(
  (data) => data.responseDeadline > data.reviewDeadlineDefault,
  {
    message: 'Response deadline must be after review deadline',
    path: ['responseDeadline']
  }
);

export const updateSubmissionWindowSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  submissionOpenAt: z.coerce.date().optional(),
  submissionCloseAt: z.coerce.date().optional(),
  reviewStartAt: z.coerce.date().optional(),
  reviewDeadlineDefault: z.coerce.date().optional(),
  responseDeadline: z.coerce.date().optional(),
  nextWindowOpensAt: z.coerce.date().optional()
});

export const updateWindowStatusSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(WindowStatus)
});

export const deleteSubmissionWindowSchema = z.object({
  id: z.string()
});

// Proposal Status Update Schema
export const updateProposalStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'PRIORITIZED'])
});
