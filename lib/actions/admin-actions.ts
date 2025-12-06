'use server';

import { revalidatePath } from 'next/cache';
import { adminAction } from './safe-action';
import * as adminService from '@/lib/services/admin';
import * as schemas from '@/lib/schemas/admin';
import { createInvitation } from '@/lib/services/invitations';
import { sendWelcomeEmail } from '@/lib/services/email';
import { prisma } from '@/lib/prisma';

// Main Area Actions
export const createMainAreaAction = adminAction
  .schema(schemas.mainAreaSchema)
  .action(async ({ parsedInput }) => {
    const mainArea = await adminService.createMainArea(parsedInput);
    revalidatePath('/admin/main-areas');
    return { success: true, mainArea };
  });

export const updateMainAreaAction = adminAction
  .schema(schemas.updateMainAreaSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    const mainArea = await adminService.updateMainArea(id, data);
    revalidatePath('/admin/main-areas');
    return { success: true, mainArea };
  });

export const deleteMainAreaAction = adminAction
  .schema(schemas.deleteMainAreaSchema)
  .action(async ({ parsedInput }) => {
    await adminService.deleteMainArea(parsedInput.id);
    revalidatePath('/admin/main-areas');
    return { success: true };
  });

// User Management Actions
export const updateUserPermissionsAction = adminAction
  .schema(schemas.updateUserPermissionsSchema)
  .action(async ({ parsedInput }) => {
    const user = await adminService.updateUserPermissions(
      parsedInput.userId,
      parsedInput.permissions
    );
    revalidatePath('/admin/users');
    return { success: true, user };
  });

export const updateUserStatusAction = adminAction
  .schema(schemas.updateUserStatusSchema)
  .action(async ({ parsedInput }) => {
    const user = await adminService.updateUserStatus(
      parsedInput.userId,
      parsedInput.isActive
    );
    revalidatePath('/admin/users');
    return { success: true, user };
  });

export const updateUserProfileAction = adminAction
  .schema(schemas.updateUserProfileSchema)
  .action(async ({ parsedInput }) => {
    const { userId, ...data } = parsedInput;
    const user = await adminService.updateUserProfile(userId, data);
    revalidatePath('/admin/users');
    return { success: true, user };
  });

// Submission Window Actions
export const createSubmissionWindowAction = adminAction
  .schema(schemas.submissionWindowSchema)
  .action(async ({ parsedInput }) => {
    const window = await adminService.createSubmissionWindow(parsedInput);
    revalidatePath('/admin/windows');
    return { success: true, window };
  });

export const updateSubmissionWindowAction = adminAction
  .schema(schemas.updateSubmissionWindowSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    const window = await adminService.updateSubmissionWindow(id, data);
    revalidatePath('/admin/windows');
    return { success: true, window };
  });

export const updateWindowStatusAction = adminAction
  .schema(schemas.updateWindowStatusSchema)
  .action(async ({ parsedInput }) => {
    const window = await adminService.updateWindowStatus(
      parsedInput.id,
      parsedInput.status
    );
    revalidatePath('/admin/windows');
    return { success: true, window };
  });

export const deleteSubmissionWindowAction = adminAction
  .schema(schemas.deleteSubmissionWindowSchema)
  .action(async ({ parsedInput }) => {
    await adminService.deleteSubmissionWindow(parsedInput.id);
    revalidatePath('/admin/windows');
    return { success: true };
  });

// User Actions
export const createUserAction = adminAction
  .schema(schemas.createUserSchema)
  .action(async ({ parsedInput }) => {
    const user = await adminService.createUser(parsedInput);
    revalidatePath('/admin/users');
    return { success: true, user };
  });

export const createUserInviteAction = adminAction
  .schema(schemas.createUserInviteSchema)
  .action(async ({ parsedInput }) => {
    // Step 1: Create placeholder user (visible in admin table immediately)
    await adminService.createPlaceholderUser({
      email: parsedInput.email,
      firstName: parsedInput.firstName,
      lastName: parsedInput.lastName,
      title: parsedInput.title,
      affiliation: parsedInput.affiliation,
      centreId: parsedInput.centreId,
      permissions: parsedInput.permissions,
      locale: parsedInput.locale,
    });

    // Step 2: Create invitation token (7-day expiry)
    const { token, expiresAt } = await createInvitation({
      email: parsedInput.email,
      locale: parsedInput.locale,
      firstName: parsedInput.firstName,
      lastName: parsedInput.lastName,
      title: parsedInput.title,
      affiliation: parsedInput.affiliation,
      centreId: parsedInput.centreId,
      permissions: parsedInput.permissions,
    });

    // Step 3: Generate setup link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const setupLink = `${appUrl}/${parsedInput.locale}/welcome/${token}`;

    // Step 4: Send welcome email
    const result = await sendWelcomeEmail({
      to: parsedInput.email,
      locale: parsedInput.locale,
      firstName: parsedInput.firstName,
      lastName: parsedInput.lastName,
      title: parsedInput.title,
      setupLink,
    });

    // Step 5: Handle email failure (rollback)
    if ('error' in result) {
      // Rollback: delete placeholder user and invitation
      await prisma.user.delete({ where: { email: parsedInput.email } }).catch(() => {});
      await prisma.verification.deleteMany({
        where: { identifier: `INVITE:${parsedInput.email}` }
      }).catch(() => {});

      throw new Error(`Failed to send invitation email: ${result.error}`);
    }

    revalidatePath('/admin/users');
    return { success: true, expiresAt };
  });

export const updateUserReviewTopicsAction = adminAction
  .schema(schemas.updateUserReviewTopicsSchema)
  .action(async ({ parsedInput }) => {
    const user = await adminService.updateUserReviewTopics(
      parsedInput.userId,
      parsedInput.mainAreaIds
    );
    revalidatePath('/admin/users');
    return { success: true, user };
  });
