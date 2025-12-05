import type { AppPermission } from '@/app/generated/prisma';

export interface AppConfig {
  id: string;
  name: string;
  permission: AppPermission;
  path: string;
  icon: string;
}

export const APPS: AppConfig[] = [
  {
    id: 'submission',
    name: 'Submission',
    permission: 'SUBMISSION',
    path: '/submission',
    icon: 'FileText'
  },
  {
    id: 'reviewing',
    name: 'Reviewing',
    permission: 'REVIEWING',
    path: '/reviewing',
    icon: 'ClipboardCheck'
  },
  {
    id: 'admin',
    name: 'Admin',
    permission: 'ADMIN',
    path: '/admin',
    icon: 'Settings'
  }
];

const VALID_PERMISSIONS: readonly string[] = [
  'SUBMISSION',
  'REVIEWING',
  'ADMIN',
];

function isAppPermission(value: string | AppPermission): value is AppPermission {
  return typeof value === 'string' && VALID_PERMISSIONS.includes(value);
}

export function parsePermissions(
  permissions: string[] | AppPermission[] | undefined
): AppPermission[] {
  if (!permissions) return [];
  const result: AppPermission[] = [];
  for (const permission of permissions) {
    if (isAppPermission(permission)) {
      result.push(permission);
    }
  }
  return result;
}

export function getAvailableApps(permissions: AppPermission[]): AppConfig[] {
  return APPS.filter((app) => permissions.includes(app.permission));
}

export function getDefaultApp(permissions: AppPermission[]): string | null {
  if (permissions.includes('SUBMISSION')) return '/submission';
  if (permissions.includes('REVIEWING')) return '/reviewing';
  if (permissions.includes('ADMIN')) return '/admin';
  return null;
}
