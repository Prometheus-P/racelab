// src/app/race/[id]/page.tsx
import React from 'react';
import { fetchRaceById } from '@/lib/api';
import { getRaceTypeEmoji } from '@/lib/utils/ui';
import { Race, Entry } from '@/types';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const race = await fetchRaceById(params.id);

  if (!race) {
    return {
      title: '경주 정보 - KRace',
    }
  }

  return {
    title: `${race.track} 제${race.raceNo}경주 - KRace`,
    description: `${race.track} 제${race.raceNo}경주 경마 상세 정보, 출전표, 배당률을 확인하세요.`,
  }
}

const EntryRow = ({ entry }: { entry: Entry }) => (
  <tr className="border-b last:border-b-0">
    <td className="p-3 text-center">{entry.no}</td>
    <td className="p-3 font-semibold">{entry.name}</td>
    <td className="p-3">{entry.jockey}</td>
    <td className="p-3">{entry.trainer}</td>
    <td className="p-3 text-center">{entry.age}</td>
    <td className="p-3 text-center">{entry.weight}</td>
    <td className="p-3">{entry.recentRecord}</td>
  </tr>
);

export default async function RaceDetailPage({ params }: { params: { id: string } }) {
  const race = await fetchRaceById(params.id);

  if (!race) {
    return <p>경주 정보를 찾을 수 없습니다.</p>;
    // In a real app, we'd use notFound() from next/navigation
    // notFound();
  }

  return (
    <div className="space-y-6">
      <header className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-4xl">{getRaceTypeEmoji(race.type)}</span>
          <div>
            <h1 className="text-2xl font-bold">{race.track} 제{race.raceNo}경주 ({race.distance}m)</h1>
            <p className="text-gray-500">{race.grade}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold font-mono">{race.startTime}</p>
            {/* Date can be added here */}
          </div>
        </div>
      </header>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">출전표</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="p-3 text-center font-medium">번호</th>
              <th className="p-3 text-left font-medium">마명/선수명</th>
              <th className="p-3 text-left font-medium">기수</th>
              <th className="p-3 text-left font-medium">조교사</th>
              <th className="p-3 text-center font-medium">연령</th>
              <th className="p-3 text-center font-medium">부담중량</th>
              <th className="p-3 text-left font-medium">최근성적</th>
            </tr>
          </thead>
          <tbody>
            {race.entries.map(entry => (
              <EntryRow key={entry.no} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
