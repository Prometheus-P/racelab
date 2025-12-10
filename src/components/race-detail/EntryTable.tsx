// src/components/race-detail/EntryTable.tsx
'use client';

import React from 'react';
import { Race, RaceType, Entry } from '@/types';

// Race type configuration for styling
const raceTypeConfig: Record<
  RaceType,
  {
    nameLabel: string;
    color: string;
    bgColor: string;
  }
> = {
  horse: {
    nameLabel: '마명',
    color: 'text-horse',
    bgColor: 'bg-horse/10',
  },
  cycle: {
    nameLabel: '선수명',
    color: 'text-cycle',
    bgColor: 'bg-cycle/10',
  },
  boat: {
    nameLabel: '선수명',
    color: 'text-boat',
    bgColor: 'bg-boat/10',
  },
};

interface EntryTableProps {
  race: Race;
  className?: string;
}

export default function EntryTable({ race, className = '' }: EntryTableProps) {
  const config = raceTypeConfig[race.type];
  const entries = race.entries || [];
  const entryCount = entries.length;
  const countLabel = race.type === 'horse' ? '두' : '명';

  if (entryCount === 0) {
    return (
      <section
        className={`rounded-xl bg-white p-4 shadow-sm md:p-6 ${className}`}
        data-testid="entry-table"
      >
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <span aria-hidden="true">📋</span>
          출전표
        </h2>
        <p className="text-center text-gray-500 py-8">출전 정보가 없습니다.</p>
      </section>
    );
  }

  return (
    <section
      className={`overflow-hidden rounded-xl bg-white shadow-sm ${className}`}
      data-testid="entry-table"
    >
      <div className="border-b border-gray-100 p-4 md:p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <span aria-hidden="true">📋</span>
          출전표
          <span className="text-sm font-normal text-gray-500">
            ({entryCount}
            {countLabel}/명)
          </span>
        </h2>
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">
            {race.track} 제{race.raceNo}경주 출전표 - {entryCount}
            {countLabel} 참가
          </caption>
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th scope="col" className="w-16 p-3 text-center font-medium text-gray-700">
                번호
              </th>
              <th scope="col" className="p-3 text-left font-medium text-gray-700">
                {config.nameLabel}
              </th>
              {race.type === 'horse' && (
                <>
                  <th scope="col" className="p-3 text-left font-medium text-gray-700">
                    기수
                  </th>
                  <th scope="col" className="p-3 text-left font-medium text-gray-700">
                    조교사
                  </th>
                  <th scope="col" className="w-16 p-3 text-center font-medium text-gray-700">
                    연령
                  </th>
                  <th scope="col" className="w-24 p-3 text-center font-medium text-gray-700">
                    부담중량
                  </th>
                </>
              )}
              {race.type === 'cycle' && (
                <th scope="col" className="w-20 p-3 text-center font-medium text-gray-700">
                  점수
                </th>
              )}
              {race.type === 'boat' && (
                <>
                  <th scope="col" className="p-3 text-left font-medium text-gray-700">
                    모터
                  </th>
                  <th scope="col" className="p-3 text-left font-medium text-gray-700">
                    보트
                  </th>
                  <th scope="col" className="w-20 p-3 text-center font-medium text-gray-700">
                    점수
                  </th>
                </>
              )}
              <th scope="col" className="p-3 text-left font-medium text-gray-700">
                최근성적
              </th>
              <th scope="col" className="w-20 p-3 text-center font-medium text-gray-700">
                단승
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <EntryRow
                key={entry.no}
                entry={entry}
                raceType={race.type}
                isEven={index % 2 === 0}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 p-4 md:hidden" data-testid="entry-table-mobile">
        {entries.map((entry) => (
          <EntryCard key={entry.no} entry={entry} raceType={race.type} />
        ))}
      </div>
    </section>
  );
}

// Desktop table row component
function EntryRow({
  entry,
  raceType,
  isEven,
}: {
  entry: Entry;
  raceType: RaceType;
  isEven: boolean;
}) {
  const config = raceTypeConfig[raceType];

  return (
    <tr className={`border-b transition-colors last:border-b-0 hover:bg-gray-50 ${isEven ? 'bg-white' : 'bg-gray-50/50'}`}>
      <td className="p-3 text-center">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${config.bgColor} ${config.color} font-bold`}
        >
          {entry.no}
        </span>
      </td>
      <td className="p-3 font-semibold text-gray-900">{entry.name}</td>
      {raceType === 'horse' && (
        <>
          <td className="p-3 text-gray-700">{entry.jockey || '-'}</td>
          <td className="p-3 text-gray-700">{entry.trainer || '-'}</td>
          <td className="p-3 text-center text-gray-700">
            {entry.age ? `${entry.age}세` : '-'}
          </td>
          <td className="p-3 text-center text-gray-700">
            {entry.weight ? `${entry.weight}kg` : '-'}
          </td>
        </>
      )}
      {raceType === 'cycle' && (
        <td className="p-3 text-center text-gray-700">{entry.score ?? '-'}</td>
      )}
      {raceType === 'boat' && (
        <>
          <td className="p-3 text-gray-700">{entry.motor || '-'}</td>
          <td className="p-3 text-gray-700">{entry.boat || '-'}</td>
          <td className="p-3 text-center text-gray-700">{entry.score ?? '-'}</td>
        </>
      )}
      <td className="p-3 font-mono text-xs text-gray-600">{entry.recentRecord || '-'}</td>
      <td className="p-3 text-center font-bold text-gray-900">
        {entry.odds != null ? entry.odds : '-'}
      </td>
    </tr>
  );
}

// Mobile card component
function EntryCard({ entry, raceType }: { entry: Entry; raceType: RaceType }) {
  const config = raceTypeConfig[raceType];

  return (
    <article
      className={`rounded-lg border p-4 border-gray-200 bg-white`}
      aria-label={`${entry.no}번 ${entry.name}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor} ${config.color} text-lg font-bold`}
        >
          {entry.no}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-gray-900">{entry.name}</h3>
          <div className="mt-1 space-y-0.5 text-sm text-gray-600">
            {raceType === 'horse' && (
              <>
                {entry.jockey && <p>기수: {entry.jockey}</p>}
                {entry.trainer && <p>조교사: {entry.trainer}</p>}
                <div className="flex gap-4 text-xs text-gray-500">
                  {entry.age && <span>연령: {entry.age}세</span>}
                  {entry.weight && <span>중량: {entry.weight}kg</span>}
                </div>
              </>
            )}
            {raceType === 'cycle' && entry.score && <p>점수: {entry.score}</p>}
            {raceType === 'boat' && (
              <>
                {entry.motor && <p>모터: {entry.motor}</p>}
                {entry.boat && <p>보트: {entry.boat}</p>}
                {entry.score && <p>점수: {entry.score}</p>}
              </>
            )}
            {entry.recentRecord && (
              <p className="text-xs text-gray-500">최근성적: {entry.recentRecord}</p>
            )}
          </div>
        </div>
        {entry.odds != null && (
          <div className="text-right">
            <span className="text-xs text-gray-500">단승</span>
            <p className={`text-lg font-bold ${config.color}`}>
              {entry.odds}
              <span className="ml-0.5 text-xs font-normal">배</span>
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
