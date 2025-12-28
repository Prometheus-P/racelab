// src/components/ResultCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { HistoricalRace, RaceType } from '@/types';
import { M3Card } from './ui/M3Card';
import { DividendDisplay } from './DividendDisplay';

export interface ResultCardProps {
  race: HistoricalRace;
  onClick?: () => void;
  expanded?: boolean;
  'data-testid'?: string;
}

const raceTypeIcons: Record<RaceType, string> = {
  horse: '🐎',
  cycle: '🚴',
  boat: '🚤',
};

const raceTypeColors: Record<RaceType, string> = {
  horse: 'border-horse',
  cycle: 'border-cycle',
  boat: 'border-boat',
};

const raceTypeBgColors: Record<RaceType, string> = {
  horse: 'bg-horse-container',
  cycle: 'bg-cycle-container',
  boat: 'bg-boat-container',
};

/**
 * Returns display name for a finisher, with fallback for missing data.
 * T054a: Handle missing finisher data gracefully
 */
function getFinisherDisplayName(name: string | null | undefined, entryNo: number): string {
  if (name && name.trim()) {
    return name;
  }
  return `출전마 #${entryNo}`;
}

/**
 * Returns display name for a track, with fallback for missing data.
 * T054b: Handle missing track info gracefully
 */
function getTrackDisplayName(track: string | null | undefined): string {
  if (track && track.trim()) {
    return track;
  }
  return '경주장 미정';
}

export function ResultCard({
  race,
  onClick,
  expanded = false,
  'data-testid': testId = 'result-card',
}: ResultCardProps) {
  const top3 = race.results.slice(0, 3);
  const winDividend = race.dividends.find((d) => d.type === 'win');
  const isCanceled = race.status === 'canceled';

  const borderColor = raceTypeColors[race.type];

  return (
    <M3Card
      variant="elevated"
      elevation={1}
      onClick={onClick}
      className={`border-l-4 ${borderColor} min-h-[48px]`}
      data-testid={testId}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xl ${raceTypeBgColors[race.type]} flex h-8 w-8 items-center justify-center rounded-full`}
              data-testid="race-type-icon"
            >
              {raceTypeIcons[race.type]}
            </span>
            <div>
              <div className="text-title-medium font-medium text-on-surface">
                {getTrackDisplayName(race.track)} {race.raceNo}경주
              </div>
              <div className="text-body-small text-on-surface-variant">
                {race.date} {race.startTime}
              </div>
            </div>
          </div>

          {isCanceled && (
            <span className="rounded-m3-sm bg-error-container px-2 py-1 text-label-medium text-error">
              취소
            </span>
          )}
        </div>

        {/* Top 3 Finishers */}
        {!isCanceled && (
          <div className="space-y-1">
            {top3.map((result) => (
              <div
                key={result.rank}
                className="flex items-center gap-3 py-1"
                data-testid={`rank-${result.rank}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-label-medium font-bold ${
                    result.rank === 1
                      ? 'bg-amber-100 text-amber-800'
                      : result.rank === 2
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {result.rank}
                </span>
                <span className="flex-1 text-body-medium text-on-surface">
                  {getFinisherDisplayName(result.name, result.entryNo)}
                </span>
                {result.jockey && (
                  <span className="text-body-small text-on-surface-variant">{result.jockey}</span>
                )}
                {result.time && (
                  <span className="font-mono text-body-small text-on-surface-variant">
                    {result.time}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dividend */}
        {!isCanceled && winDividend && (
          <div data-testid="dividend">
            <DividendDisplay dividends={[winDividend]} compact />
          </div>
        )}

        {/* Detail Link */}
        {race.id && (
          <div className="flex justify-end pt-2">
            <Link
              href={`/race/${race.id}`}
              className="text-label-medium font-medium text-primary hover:text-primary-dark hover:underline"
              onClick={(e) => e.stopPropagation()}
              data-testid="detail-link"
            >
              상세 보기 →
            </Link>
          </div>
        )}

        {/* Expanded Detail */}
        {expanded && !isCanceled && (
          <div data-testid="result-detail" className="border-t border-outline-variant pt-3">
            {/* All finishers */}
            <div className="space-y-1">
              {race.results.slice(3).map((result) => (
                <div
                  key={result.rank}
                  className="flex items-center gap-3 py-1"
                  data-testid={`rank-${result.rank}`}
                >
                  <span className="flex h-6 w-6 items-center justify-center text-label-medium text-on-surface-variant">
                    {result.rank}
                  </span>
                  <span className="flex-1 text-body-medium text-on-surface">
                    {getFinisherDisplayName(result.name, result.entryNo)}
                  </span>
                  {result.jockey && (
                    <span className="text-body-small text-on-surface-variant">{result.jockey}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Full Dividends */}
            <div className="mt-3">
              <DividendDisplay dividends={race.dividends} />
            </div>
          </div>
        )}
      </div>
    </M3Card>
  );
}
