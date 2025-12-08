'use client';

import { useState, useMemo } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { updateUserReviewTopicsAction } from '@/lib/actions/admin-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { TopicBadge } from '@/components/design-system/topic-badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewTopic {
  id: string;
  code: string | null;
  label: string;
  categoryCode?: string | null;
}

interface ReviewTopicsDialogProps {
  userId: string;
  userName: string;
  isReviewer: boolean;
  currentTopics: ReviewTopic[];
  allMainAreas: ReviewTopic[];
}

export function ReviewTopicsDialog({
  userId,
  userName,
  isReviewer,
  currentTopics,
  allMainAreas
}: ReviewTopicsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  // Group topics by category code
  const topicsByCategory = useMemo(() => {
    const groups: Record<string, ReviewTopic[]> = {};
    allMainAreas.forEach((topic) => {
      const categoryCode = topic.code?.split('-')[0] || 'Other';
      if (!groups[categoryCode]) {
        groups[categoryCode] = [];
      }
      groups[categoryCode].push(topic);
    });
    return groups;
  }, [allMainAreas]);

  // Filter topics based on search
  const filteredCategories = useMemo(() => {
    if (!search) return topicsByCategory;

    const searchLower = search.toLowerCase();
    const filtered: Record<string, ReviewTopic[]> = {};

    Object.entries(topicsByCategory).forEach(([category, topics]) => {
      const matchingTopics = topics.filter((topic) =>
        topic.code?.toLowerCase().includes(searchLower) ||
        topic.label.toLowerCase().includes(searchLower)
      );
      if (matchingTopics.length > 0) {
        filtered[category] = matchingTopics;
      }
    });

    return filtered;
  }, [topicsByCategory, search]);

  // Initialize selected topics when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setSelectedTopics(currentTopics.map((t) => t.id));
      setSearch('');
    }
    setOpen(newOpen);
  };

  const { execute, status } = useAction(updateUserReviewTopicsAction, {
    onSuccess: () => {
      toast.success('Review topics updated successfully');
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update review topics');
    }
  });

  const handleToggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = () => {
    execute({ userId, mainAreaIds: selectedTopics });
  };

  if (!isReviewer) {
    return (
      <span className='text-sm text-muted-foreground'>Not a reviewer</span>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className='flex items-center gap-2'>
          {currentTopics.length > 0 ? (
            <div className='flex flex-wrap gap-1'>
              {currentTopics.map((topic) => (
                <TopicBadge key={topic.id} topic={topic} className='text-xs' />
              ))}
            </div>
          ) : (
            <span className='text-sm text-muted-foreground'>No topics</span>
          )}
          <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
            <Plus className='h-3 w-3' />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Manage Review Topics for {userName}</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-sm text-muted-foreground mb-4'>
            Select the main areas this reviewer can review:
          </p>

          <div className='mb-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                type='text'
                placeholder='Search by topic code or label...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-9'
              />
              {search && (
                <button
                  type='button'
                  onClick={() => setSearch('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>
          </div>

          <div className='max-h-[400px] overflow-y-auto border rounded-md'>
            <Accordion type='multiple' className='w-full'>
              {Object.entries(filteredCategories).map(([categoryCode, topics]) => (
                <AccordionItem key={categoryCode} value={categoryCode}>
                  <AccordionTrigger className='px-4 py-3 hover:no-underline'>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono font-semibold text-pink-600'>{categoryCode}</span>
                      <Badge variant='secondary' className='ml-2'>
                        {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='px-4 pb-4'>
                    <div className='space-y-2'>
                      {topics.map((topic) => {
                        const isSelected = selectedTopics.includes(topic.id);
                        return (
                          <div key={topic.id} className='flex items-center gap-3 p-2 rounded hover:bg-muted/50'>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleTopic(topic.id)}
                              id={`topic-${topic.id}`}
                            />
                            <label
                              htmlFor={`topic-${topic.id}`}
                              className='flex-1 cursor-pointer text-sm'
                            >
                              <span className='font-mono text-xs text-pink-600 mr-2'>{topic.code}</span>
                              {topic.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={status === 'executing'}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={status === 'executing'}>
            {status === 'executing' ? 'Saving...' : 'Save Topics'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
