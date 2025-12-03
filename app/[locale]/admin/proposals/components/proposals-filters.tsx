'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProposalsFiltersProps {
  mainAreas: { id: string; label: string }[];
  windows: { id: string; name: string }[];
  centres: string[];
  onFilterChange: (filters: {
    mainAreaId: string | null;
    windowId: string | null;
    centreCode: string | null;
  }) => void;
}

export function ProposalsFilters({
  mainAreas,
  windows,
  centres,
  onFilterChange
}: ProposalsFiltersProps) {
  const [selectedMainArea, setSelectedMainArea] = useState<string | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [selectedCentre, setSelectedCentre] = useState<string | null>(null);

  const handleMainAreaChange = (value: string) => {
    const newValue = value === 'all' ? null : value;
    setSelectedMainArea(newValue);
    onFilterChange({
      mainAreaId: newValue,
      windowId: selectedWindow,
      centreCode: selectedCentre
    });
  };

  const handleWindowChange = (value: string) => {
    const newValue = value === 'all' ? null : value;
    setSelectedWindow(newValue);
    onFilterChange({
      mainAreaId: selectedMainArea,
      windowId: newValue,
      centreCode: selectedCentre
    });
  };

  const handleCentreChange = (value: string) => {
    const newValue = value === 'all' ? null : value;
    setSelectedCentre(newValue);
    onFilterChange({
      mainAreaId: selectedMainArea,
      windowId: selectedWindow,
      centreCode: newValue
    });
  };

  const handleClearFilters = () => {
    setSelectedMainArea(null);
    setSelectedWindow(null);
    setSelectedCentre(null);
    onFilterChange({
      mainAreaId: null,
      windowId: null,
      centreCode: null
    });
  };

  const hasActiveFilters = selectedMainArea || selectedWindow || selectedCentre;

  return (
    <div className='flex items-center gap-4 mb-6'>
      <div className='flex-1 flex items-center gap-3'>
        <Select
          value={selectedMainArea || 'all'}
          onValueChange={handleMainAreaChange}
        >
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder='Main Topic' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Topics</SelectItem>
            {mainAreas.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedWindow || 'all'} onValueChange={handleWindowChange}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder='Window' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Windows</SelectItem>
            {windows.map((window) => (
              <SelectItem key={window.id} value={window.id}>
                {window.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCentre || 'all'} onValueChange={handleCentreChange}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder='Centre' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Centres</SelectItem>
            {centres.map((centre) => (
              <SelectItem key={centre} value={centre}>
                {centre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant='ghost'
          size='sm'
          onClick={handleClearFilters}
          className='gap-2'
        >
          <X className='h-4 w-4' />
          Clear filters
        </Button>
      )}
    </div>
  );
}
