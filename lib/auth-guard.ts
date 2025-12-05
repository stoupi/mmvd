import { redirect } from 'next/navigation';
import { getTypedSession } from './auth-helpers';
import { hasPermission } from './permissions';
import { getDefaultApp } from './app-config';
import type { AppPermission } from '@/app/generated/prisma';

export async function redirectIfAuthenticated() {
  const session = await getTypedSession();

  if (session) {
    const defaultRoute = getDefaultApp(session.user.permissions);
    redirect(defaultRoute || '/dashboard');
  }
}

export async function requireAuth() {
  const session = await getTypedSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function requirePermissionGuard(permission: AppPermission) {
  const session = await requireAuth();
  if (!hasPermission(session, permission)) {
    redirect('/');
  }
  return session;
}