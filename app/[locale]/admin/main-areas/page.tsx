import { requirePermissionGuard } from '@/lib/auth-guard';
import { getAllMainAreas } from '@/lib/services/admin';
import { FolderOpen } from 'lucide-react';
import { MainAreaList } from './components/main-area-list';
import { CreateMainAreaDialog } from './components/create-main-area-dialog';

export default async function MainAreasPage() {
  await requirePermissionGuard('ADMIN');

  const mainAreas = await getAllMainAreas();

  return (
    <div className='p-8'>
      <div className='flex items-start justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Topics</h1>
          <p className='text-muted-foreground'>
            Manage research topics for abstract classification
          </p>
        </div>
        <CreateMainAreaDialog />
      </div>

      {mainAreas.length === 0 ? (
        <div className='text-center py-12'>
          <FolderOpen className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No main areas yet</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Create your first main area to categorize proposals
          </p>
        </div>
      ) : (
        <MainAreaList mainAreas={mainAreas} />
      )}
    </div>
  );
}
