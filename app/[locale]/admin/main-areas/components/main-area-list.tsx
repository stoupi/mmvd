'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { EditMainAreaDialog } from './edit-main-area-dialog';
import { DeleteMainAreaDialog } from './delete-main-area-dialog';
import { useState } from 'react';

interface MainArea {
  id: string;
  label: string;
  description: string | null;
  _count: {
    proposals: number;
  };
}

interface MainAreaListProps {
  mainAreas: MainArea[];
}

export function MainAreaList({ mainAreas }: MainAreaListProps) {
  return (
    <div className='space-y-4'>
      {mainAreas.map((area) => (
        <div
          key={area.id}
          className='flex items-start justify-between p-4 border rounded-lg bg-white'
        >
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <h3 className='font-semibold'>{area.label}</h3>
              <Badge variant='outline'>
                {area._count.proposals} {area._count.proposals === 1 ? 'proposal' : 'proposals'}
              </Badge>
            </div>
            {area.description && (
              <p className='text-sm text-muted-foreground'>{area.description}</p>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <EditMainAreaDialog mainArea={area} />
            <DeleteMainAreaDialog
              mainAreaId={area.id}
              mainAreaLabel={area.label}
              proposalCount={area._count.proposals}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
