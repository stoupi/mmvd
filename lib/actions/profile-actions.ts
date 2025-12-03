'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedAction } from './safe-action';
import * as profileService from '@/lib/services/profile';
import * as schemas from '@/lib/schemas/profile';

export const updateOwnProfileAction = authenticatedAction
  .schema(schemas.updateOwnProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const user = await profileService.updateOwnProfile(ctx.userId, parsedInput);
    revalidatePath('/profile');
    return { success: true, user };
  });

export const updateAvatarAction = authenticatedAction
  .schema(schemas.updateAvatarSchema)
  .action(async ({ parsedInput, ctx }) => {
    const user = await profileService.updateAvatar(ctx.userId, parsedInput.avatarUrl);
    revalidatePath('/profile');
    return { success: true, user };
  });
