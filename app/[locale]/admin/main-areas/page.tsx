import { requirePermissionGuard } from '@/lib/auth-guard';
import { getTopicsForAdmin } from '@/lib/services/submission';
import { getAllCategories } from '@/lib/services/admin';
import { FolderOpen } from 'lucide-react';
import { TopicsTable } from './components/topics-table';
import { CreateMainAreaDialog } from './components/create-main-area-dialog';

export default async function MainAreasPage() {
  await requirePermissionGuard('ADMIN');

  const [topics, categories] = await Promise.all([
    getTopicsForAdmin(),
    getAllCategories()
  ]);

  return (
    <div className='p-8'>
      <div className='flex items-start justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Main Topics</h1>
          <p className='text-muted-foreground'>
            {topics.length} active topics
          </p>
        </div>
        <CreateMainAreaDialog categories={categories} />
      </div>

      {topics.length === 0 ? (
        <div className='text-center py-12'>
          <FolderOpen className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No topics yet</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Create your first topic to categorize proposals
          </p>
        </div>
      ) : (
        <TopicsTable topics={topics} />
      )}
    </div>
  );
}
