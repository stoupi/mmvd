'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditMainAreaDialog } from './edit-main-area-dialog';
import { DeleteMainAreaDialog } from './delete-main-area-dialog';
import type { Category, MainArea, User } from '@/app/generated/prisma';

type SortField = 'category' | 'topic' | 'proposals' | 'reviewers';
type SortDirection = 'asc' | 'desc';

interface TopicWithDetails extends MainArea {
  category: Category | null;
  reviewers: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>[];
  _count: {
    proposals: number;
  };
}

interface TopicsTableProps {
  topics: TopicWithDetails[];
}

export function TopicsTable({ topics }: TopicsTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('category');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className='h-4 w-4 ml-1 text-muted-foreground' />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className='h-4 w-4 ml-1' />
    ) : (
      <ArrowDown className='h-4 w-4 ml-1' />
    );
  };

  const filteredAndSortedTopics = useMemo(() => {
    let filtered = topics;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = topics.filter((topic) => {
        const categoryMatch = topic.category?.label.toLowerCase().includes(searchLower) ||
                              topic.category?.code.toLowerCase().includes(searchLower);
        const topicMatch = topic.label.toLowerCase().includes(searchLower) ||
                          topic.code?.toLowerCase().includes(searchLower);
        const reviewerMatch = topic.reviewers.some(
          (reviewer) =>
            reviewer.firstName.toLowerCase().includes(searchLower) ||
            reviewer.lastName.toLowerCase().includes(searchLower) ||
            reviewer.email.toLowerCase().includes(searchLower)
        );
        return categoryMatch || topicMatch || reviewerMatch;
      });
    }

    return filtered.sort((topicA, topicB) => {
      let comparison = 0;

      switch (sortField) {
        case 'category':
          comparison = (topicA.category?.label || '').localeCompare(
            topicB.category?.label || ''
          );
          break;
        case 'topic':
          comparison = topicA.label.localeCompare(topicB.label);
          break;
        case 'proposals':
          comparison = topicA._count.proposals - topicB._count.proposals;
          break;
        case 'reviewers':
          comparison = topicA.reviewers.length - topicB.reviewers.length;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [topics, search, sortField, sortDirection]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search topics or reviewers...'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className='pl-9'
          />
        </div>
        <div className='text-sm text-muted-foreground'>
          {filteredAndSortedTopics.length} of {topics.length} topics
        </div>
      </div>

      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('category')}
                  className='font-semibold hover:bg-transparent p-0'
                >
                  Category
                  {getSortIcon('category')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('topic')}
                  className='font-semibold hover:bg-transparent p-0'
                >
                  Topic
                  {getSortIcon('topic')}
                </Button>
              </TableHead>
              <TableHead className='text-center'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('proposals')}
                  className='font-semibold hover:bg-transparent p-0'
                >
                  Proposals
                  {getSortIcon('proposals')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('reviewers')}
                  className='font-semibold hover:bg-transparent p-0'
                >
                  Reviewers
                  {getSortIcon('reviewers')}
                </Button>
              </TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTopics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center py-8 text-muted-foreground'>
                  No topics found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTopics.map((topic) => (
                <TableRow key={topic.id} className='hover:bg-gray-50'>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono font-semibold text-pink-600'>
                        {topic.category?.code}
                      </span>
                      <span className='text-sm'>{topic.category?.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col'>
                      <div className='flex items-center gap-2'>
                        <span className='font-mono text-xs text-muted-foreground'>
                          {topic.code}
                        </span>
                        <span className='font-medium'>{topic.label}</span>
                      </div>
                      {topic.description && (
                        <span className='text-xs text-muted-foreground mt-1'>
                          {topic.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge variant='outline'>{topic._count.proposals}</Badge>
                  </TableCell>
                  <TableCell>
                    {topic.reviewers.length === 0 ? (
                      <span className='text-sm text-muted-foreground'>None</span>
                    ) : (
                      <div className='flex flex-wrap gap-1'>
                        {topic.reviewers.map((reviewer) => (
                          <Badge
                            key={reviewer.id}
                            variant='secondary'
                            className='text-xs'
                          >
                            {reviewer.firstName} {reviewer.lastName}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <EditMainAreaDialog mainArea={topic} />
                      <DeleteMainAreaDialog
                        mainAreaId={topic.id}
                        mainAreaLabel={topic.label}
                        proposalCount={topic._count.proposals}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
