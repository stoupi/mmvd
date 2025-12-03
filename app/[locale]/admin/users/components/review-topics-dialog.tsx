'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { updateUserReviewTopicsAction } from '@/lib/actions/admin-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewTopic {
  id: string;
  label: string;
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

  // Initialize selected topics when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setSelectedTopics(currentTopics.map((t) => t.id));
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
                <Badge key={topic.id} variant='secondary' className='text-xs'>
                  {topic.label}
                </Badge>
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
          <div className='flex flex-wrap gap-2'>
            {allMainAreas.map((area) => {
              const isSelected = selectedTopics.includes(area.id);
              return (
                <button
                  key={area.id}
                  type='button'
                  onClick={() => handleToggleTopic(area.id)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {area.label}
                </button>
              );
            })}
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
