// src/components/HorseEntryTable.tsx
import React from 'react';
import { Race, Entry } from '@/types';
import { M3Card } from '@/components/ui/M3Card';

interface HorseEntryTableProps {
  race: Race;
  entries?: Entry[];
}

export default function HorseEntryTable({ race, entries }: HorseEntryTableProps) {
  const renderedEntries = entries?.length ? entries : race.entries || [];
  // Use race.date if available, otherwise extract from ID for backward compatibility
  const raceDate = race.date || race.id.split('-').pop() || '';

  return (
    <M3Card density="compact" data-testid="horse-entry-table">
      <section aria-label={`경주 ${race.raceNo} 출전표`} className="space-y-4">
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">경주번호</p>
            <p className="text-2xl font-semibold">
              {race.track} · {race.raceNo}R
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>{raceDate}</p>
            <p className="text-xs">상태: {race.status}</p>
          </div>
        </header>

        {renderedEntries.length === 0 ? (
          <p className="text-sm text-gray-500">등록된 선수 정보가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-1.5 pr-4">번호</th>
                  <th className="py-1.5 pr-4">선수명</th>
                  <th className="py-1.5 pr-4 text-right">연령</th>
                  <th className="py-1.5 pr-4">조교사</th>
                  <th className="py-1.5 text-right">최근 기록</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {renderedEntries.map((entry, index) => (
                  <tr
                    key={entry.no}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-table-row-alt'}
                  >
                    <td className={`py-1 pr-4 font-bold text-${race.type}-bold`}>{entry.no}</td>
                    <td className={`py-1 pr-4 font-bold text-${race.type}-bold`}>{entry.name}</td>
                    <td className="py-1 pr-4 text-right">{entry.age ?? '—'}</td>
                    <td className="py-1 pr-4">{entry.trainer ?? '미정'}</td>
                    <td className="py-1 text-right">{entry.recentRecord ?? '기록 없음'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </M3Card>
  );
}
