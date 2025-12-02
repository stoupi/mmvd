import { AppPermission } from '@/app/generated/prisma';
import type { BetterAuthSession } from '@/types/session';

export function hasPermission(
  session: BetterAuthSession | null,
  permission: AppPermission
): boolean {
  if (!session?.user) return false;
  return session.user.permissions?.includes(permission) ?? false;
}

export function requirePermission(
  session: BetterAuthSession | null,
  permission: AppPermission
): void {
  if (!hasPermission(session, permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }
}

export function hasAnyPermission(
  session: BetterAuthSession | null,
  permissions: AppPermission[]
): boolean {
  if (!session?.user) return false;
  return permissions.some((permission) =>
    session.user.permissions?.includes(permission) ?? false
  );
}

export function getAllPermissions(session: BetterAuthSession | null): AppPermission[] {
  return session?.user?.permissions ?? [];
}
