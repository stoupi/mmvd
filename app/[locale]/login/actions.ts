'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { unauthenticatedAction } from '@/lib/actions/safe-action';
import { getTranslations } from 'next-intl/server';
import { getDefaultApp } from '@/lib/app-config';
import { prisma } from '@/lib/prisma';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginAction = unauthenticatedAction
  .inputSchema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const t = await getTranslations('auth');

    try {
      const result = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
      });

      if ('error' in result && result.error) {
        return {
          success: false,
          error: t('invalidCredentials'),
        };
      }

      // Fetch full user data from database to get permissions
      const user = await prisma.user.findUnique({
        where: { email },
        select: { permissions: true },
      });

      console.log('Login - User email:', email);
      console.log('Login - Permissions from DB:', user?.permissions);

      const permissions = (user?.permissions as string[]) || [];
      const defaultRoute = getDefaultApp(permissions);
      console.log('Login - Default route:', defaultRoute);

      return {
        success: true,
        redirectTo: defaultRoute || '/dashboard',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: t('invalidCredentials'),
      };
    }
  });