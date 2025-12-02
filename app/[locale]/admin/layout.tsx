import { requirePermissionGuard } from '@/lib/auth-guard';
import { AdminSidebar } from './components/admin-sidebar';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requirePermissionGuard('ADMIN');

  return (
    <div className='flex min-h-screen'>
      <AdminSidebar />
      <main className='flex-1 bg-gray-50'>
        {children}
      </main>
    </div>
  );
}
