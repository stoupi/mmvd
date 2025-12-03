import { z } from 'zod';

export const updateOwnProfileSchema = z.object({
  affiliation: z.string().optional().transform(val => val === '' ? undefined : val),
  centreCode: z.string().regex(/^\d{3}$/, 'Centre code must be 3 digits'),
  centreName: z.string().min(1, 'Centre name is required')
});

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().url('Invalid URL')
});
