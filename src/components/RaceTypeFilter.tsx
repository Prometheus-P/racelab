// src/components/RaceTypeFilter.tsx
'use client';

import React, { useCallback } from 'react';
import { M3Chip } from './ui/M3Chip';
import { RaceType } from '@/types';

interface RaceTypeFilterProps {
  selectedTypes?: RaceType[];
  onChange?: (types: RaceType[]) => void;
  className?: string;
  'data-testid'?: string;
}

const raceTypes: { type: RaceType; label: string; icon: string }[] = [
  { type: 'horse', label: '경마', icon: '🐎' },
  { type: 'cycle', label: '경륜', icon: '🚴' },
  { type: 'boat', label: '경정', icon: '🚤' },
];

export function RaceTypeFilter({
  selectedTypes = [],
  onChange,
  className = '',
  'data-testid': testId,
}: RaceTypeFilterProps) {
  const handleChipClick = useCallback(
    (type: RaceType) => {
      if (!onChange) return;

      if (selectedTypes.includes(type)) {
        // Remove type
        onChange(selectedTypes.filter((t) => t !== type));
      } else {
        // Add type
        onChange([...selectedTypes, type]);
      }
    },
    [onChange, selectedTypes]
  );

  return (
    <div
      role="group"
      aria-label="종목 필터"
      className={`flex flex-wrap gap-2 ${className}`}
      data-testid={testId}
    >
      {raceTypes.map(({ type, label, icon }) => {
        const isSelected = selectedTypes.includes(type);

        return (
          <M3Chip
            key={type}
            label={label}
            selected={isSelected}
            onClick={() => handleChipClick(type)}
            colorVariant={type}
            leadingIcon={<span>{icon}</span>}
            aria-label={`${label} 필터`}
          />
        );
      })}
    </div>
  );
}
