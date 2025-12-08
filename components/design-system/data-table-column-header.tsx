'use client';

import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortOrder = 'asc' | 'desc' | null;

interface DataTableColumnHeaderProps<T extends string> {
  field: T;
  label: string;
  currentSortField: T | null;
  currentSortOrder: SortOrder;
  onSort: (field: T) => void;
  className?: string;
}

export function DataTableColumnHeader<T extends string>({
  field,
  label,
  currentSortField,
  currentSortOrder,
  onSort,
  className = ''
}: DataTableColumnHeaderProps<T>) {
  const isCurrentField = currentSortField === field;

  const SortIcon = () => {
    if (!isCurrentField) return <ArrowUpDown className='h-4 w-4 ml-1' />;
    return currentSortOrder === 'asc' ? (
      <ArrowUp className='h-4 w-4 ml-1' />
    ) : (
      <ArrowDown className='h-4 w-4 ml-1' />
    );
  };

  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center hover:text-foreground ${className}`}
    >
      {label}
      <SortIcon />
    </button>
  );
}

export function useSortableTable<T extends string>(initialField: T) {
  const [sortField, setSortField] = useState<T>(initialField);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: T) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return { sortField, sortOrder, handleSort };
}
