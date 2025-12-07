'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EditMainAreaDialog } from './edit-main-area-dialog';
import { DeleteMainAreaDialog } from './delete-main-area-dialog';
import type { Category, MainArea } from '@/app/generated/prisma';

interface MainAreaListProps {
  categoriesWithTopics: (Category & { topics: MainArea[] })[];
}

export function MainAreaList({ categoriesWithTopics }: MainAreaListProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const handleExpandAll = () => {
    setOpenCategories(categoriesWithTopics.map((cat) => cat.code));
  };

  const handleCollapseAll = () => {
    setOpenCategories([]);
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-end gap-2 mb-4'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={handleExpandAll}
        >
          <ChevronDown className='h-4 w-4 mr-2' />
          Expand All
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={handleCollapseAll}
        >
          <ChevronUp className='h-4 w-4 mr-2' />
          Collapse All
        </Button>
      </div>

      <Accordion
        type='multiple'
        value={openCategories}
        onValueChange={setOpenCategories}
        className='w-full border rounded-lg'
      >
        {categoriesWithTopics.map((category) => (
          <AccordionItem key={category.id} value={category.code}>
            <AccordionTrigger className='px-6 py-4 hover:bg-gray-50'>
              <div className='flex items-center gap-3'>
                <span className='font-mono font-bold text-lg text-pink-600'>
                  {category.code}
                </span>
                <span className='font-semibold text-base'>{category.label}</span>
                <Badge variant='outline' className='ml-2'>
                  {category.topics.length} topics
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className='px-6 pb-4'>
              {category.description && (
                <p className='text-sm text-muted-foreground mb-4'>
                  {category.description}
                </p>
              )}
              <div className='space-y-2'>
                {category.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className='flex items-start justify-between p-3 border rounded-lg bg-white hover:bg-gray-50'
                  >
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='font-mono text-sm text-gray-600'>
                          {topic.code}
                        </span>
                        <h3 className='font-medium'>{topic.label}</h3>
                      </div>
                      {topic.description && (
                        <p className='text-sm text-muted-foreground'>
                          {topic.description}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center gap-2 ml-4'>
                      <EditMainAreaDialog mainArea={topic} />
                      <DeleteMainAreaDialog
                        mainAreaId={topic.id}
                        mainAreaLabel={topic.label}
                        proposalCount={0}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
