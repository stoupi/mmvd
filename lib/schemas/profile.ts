import { z } from 'zod';

export const updateOwnProfileSchema = z.object({
  affiliation: z.string().optional().transform(val => val === '' ? undefined : val)
});

export const updateAvatarSchema = z.object({
  avatarUrl: z.string()
});

export const deleteAvatarSchema = z.object({});
