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
  submissionStart: z.coerce.date(),
  submissionEnd: z.coerce.date(),
  reviewDeadline: z.coerce.date()
}).refine(
  (data) => data.submissionEnd > data.submissionStart,
  {
    message: 'Submission end date must be after start date',
    path: ['submissionEnd']
  }
).refine(
  (data) => data.reviewDeadline > data.submissionEnd,
  {
    message: 'Review deadline must be after submission end date',
    path: ['reviewDeadline']
  }
);

export const updateSubmissionWindowSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  submissionStart: z.coerce.date().optional(),
  submissionEnd: z.coerce.date().optional(),
  reviewDeadline: z.coerce.date().optional()
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
