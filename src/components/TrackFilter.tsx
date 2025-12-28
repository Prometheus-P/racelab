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

  const handleTrackClick = (trackName: string | undefined) => {
    onChange?.(trackName);
  };

  // Determine which race types to show
  const raceTypesToShow: RaceType[] =
    selectedRaceTypes && selectedRaceTypes.length > 0
      ? selectedRaceTypes
      : (['horse', 'cycle', 'boat'] as RaceType[]);

  return (
    <div className={`flex flex-col gap-2 ${className}`} data-testid={testId}>
      {/* 전체 버튼 */}
      <button
        type="button"
        onClick={() => handleTrackClick(undefined)}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          !selectedTrack
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
        aria-pressed={!selectedTrack}
      >
        전체
      </button>

      {/* 종목별 경기장 그룹 */}
      {raceTypesToShow.map((raceType) => {
        const tracks = tracksByType[raceType];
        if (!tracks || tracks.length === 0) return null;

        return (
          <div key={raceType} className="flex flex-col gap-1.5">
            <span className="text-label-small text-on-surface-variant dark:text-gray-400">
              {RACE_TYPE_NAMES[raceType]}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tracks.map((track) => (
                <button
                  key={`${raceType}-${track.code}`}
                  type="button"
                  onClick={() => handleTrackClick(track.name)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedTrack === track.name
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  aria-pressed={selectedTrack === track.name}
                >
                  {track.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
