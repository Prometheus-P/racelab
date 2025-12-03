// src/components/HorseEntryTable.tsx
import React from 'react';
import { Race, Entry } from '@/types';

interface HorseEntryTableProps {
  race: Race;
  entries?: Entry[];
}

export default function HorseEntryTable({ race, entries }: HorseEntryTableProps) {
  const renderedEntries = entries?.length ? entries : race.entries || [];

  return (
    <section
      aria-label={`경주 ${race.raceNo} 출전표`}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4"
    >
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">경주번호</p>
          <p className="text-2xl font-semibold">
            {race.track} · {race.raceNo}R
          </p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p>{race.date}</p>
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
                <th className="py-2 pr-4">번호</th>
                <th className="py-2 pr-4">선수명</th>
                <th className="py-2 pr-4">연령</th>
                <th className="py-2 pr-4">조교사</th>
                <th className="py-2">최근 기록</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {renderedEntries.map(entry => (
                <tr key={entry.no}>
                  <td className="py-2 pr-4 font-semibold">{entry.no}</td>
                  <td className="py-2 pr-4">{entry.name}</td>
                  <td className="py-2 pr-4">{entry.age ?? '—'}</td>
                  <td className="py-2 pr-4">{entry.trainer ?? '미정'}</td>
                  <td className="py-2">{entry.recentRecord ?? '기록 없음'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
