// src/components/TrackFilter.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { RaceType, Track } from '@/types';
import { getTracksByType, RACE_TYPE_NAMES } from '@/lib/constants';

interface TrackFilterProps {
  selectedTrack?: string;
  selectedRaceTypes?: RaceType[];
  onChange?: (track: string | undefined) => void;
  className?: string;
  'data-testid'?: string;
}

export function TrackFilter({
  selectedTrack,
  selectedRaceTypes,
  onChange,
  className = '',
  'data-testid': testId,
}: TrackFilterProps) {
  const prevRaceTypesRef = useRef<RaceType[] | undefined>(selectedRaceTypes);

  // Get available tracks based on selected race types
  const availableTracks = getTracksByType(selectedRaceTypes);

  // Group tracks by race type
  const tracksByType = availableTracks.reduce(
    (acc, track) => {
      if (!acc[track.raceType]) {
        acc[track.raceType] = [];
      }
      acc[track.raceType].push(track);
      return acc;
    },
    {} as Record<RaceType, Track[]>
  );

  // Clear selection if track is not in available tracks when race types change
  useEffect(() => {
    if (selectedTrack && onChange) {
      const isTrackAvailable = availableTracks.some((t) => t.name === selectedTrack);
      const raceTypesChanged =
        JSON.stringify(prevRaceTypesRef.current) !== JSON.stringify(selectedRaceTypes);

      if (!isTrackAvailable && raceTypesChanged) {
        onChange(undefined);
      }
    }
    prevRaceTypesRef.current = selectedRaceTypes;
  }, [selectedRaceTypes, selectedTrack, availableTracks, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange?.(value || undefined);
  };

  // Determine which race types to show
  const raceTypesToShow: RaceType[] =
    selectedRaceTypes && selectedRaceTypes.length > 0
      ? selectedRaceTypes
      : (['horse', 'cycle', 'boat'] as RaceType[]);

  return (
    <div className={`flex flex-col gap-1 ${className}`} data-testid={testId}>
      <label
        htmlFor="track-select"
        className="text-label-medium text-on-surface-variant"
      >
        경기장
      </label>
      <select
        id="track-select"
        value={selectedTrack || ''}
        onChange={handleChange}
        aria-label="경기장 선택"
        className="px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface
                   focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                   text-body-medium"
      >
        <option value="">전체</option>
        {raceTypesToShow.map((raceType) => {
          const tracks = tracksByType[raceType];
          if (!tracks || tracks.length === 0) return null;

          return (
            <optgroup key={raceType} label={RACE_TYPE_NAMES[raceType]}>
              {tracks.map((track) => (
                <option key={`${raceType}-${track.code}`} value={track.name}>
                  {track.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </div>
  );
}
