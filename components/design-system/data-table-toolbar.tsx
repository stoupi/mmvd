'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface FilterOption {
  value: string;
  label: string;
}

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: FilterOption[];
    width?: string;
  }[];
  className?: string;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  className = ''
}: DataTableToolbarProps) {
  return (
    <div className={`flex gap-4 ${className}`}>
      <Input
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className='max-w-sm'
      />
      {filters.map((filter, index) => (
        <Select key={index} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className={filter.width || 'w-[180px]'}>
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
