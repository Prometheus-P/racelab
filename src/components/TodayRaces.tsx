// src/components/TodayRaces.tsx
import React from 'react';
import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules } from '@/lib/api';
import { getTodayYYYYMMDD } from '@/lib/utils/date';
import { Race } from '@/types';
import Link from 'next/link';

const RaceRow = ({ race }: { race: Race }) => (
  <Link href={`/race/${race.id}`} data-testid="race-card">
    <div className="flex justify-between items-center p-3 hover:bg-gray-100 rounded-md">
      <div>
        <span className="font-semibold">{race.track} 제{race.raceNo}경주</span>
        <span className="text-sm text-gray-500 ml-2">{race.distance ? `${race.distance}m` : ''}</span>
      </div>
      <div className="text-right">
        <span className="font-mono font-bold text-lg">{race.startTime}</span>
        <span className="ml-4 text-sm text-primary hover:underline">상세보기</span>
      </div>
    </div>
  </Link>
);

const RaceSection = ({ title, races, 'data-testid': dataTestId }: { title: string; races: Race[]; 'data-testid': string }) => {
  if (races.length === 0) return null;

  return (
    <section data-testid={dataTestId} className="mb-8">
      <h2 className="text-xl font-bold mb-3 border-b pb-2">{title}</h2>
      <div className="space-y-2">
        {races.map(race => <RaceRow key={race.id} race={race} />)}
      </div>
    </section>
  );
};

export default async function TodayRaces({ filter = 'all' }: { filter?: string }) {
  const rcDate = getTodayYYYYMMDD();
  const [horseRaces, cycleRaces, boatRaces] = await Promise.all([
    fetchHorseRaceSchedules(rcDate),
    fetchCycleRaceSchedules(rcDate),
    fetchBoatRaceSchedules(rcDate),
  ]);

  // Filter races based on selected tab
  let displayRaces: { horse: Race[]; cycle: Race[]; boat: Race[] };

  if (filter === 'horse') {
    displayRaces = { horse: horseRaces, cycle: [], boat: [] };
  } else if (filter === 'cycle') {
    displayRaces = { horse: [], cycle: cycleRaces, boat: [] };
  } else if (filter === 'boat') {
    displayRaces = { horse: [], cycle: [], boat: boatRaces };
  } else {
    // 'all' or default - show all races
    displayRaces = { horse: horseRaces, cycle: cycleRaces, boat: boatRaces };
  }

  const allRaces = [...displayRaces.horse, ...displayRaces.cycle, ...displayRaces.boat];

  if (allRaces.length === 0) {
    return <p className="text-gray-500 text-center py-8">오늘 예정된 경주가 없습니다.</p>;
  }

  return (
    <div>
      <RaceSection title="🐎 경마" races={displayRaces.horse} data-testid="race-section-horse" />
      <RaceSection title="🚴 경륜" races={displayRaces.cycle} data-testid="race-section-cycle" />
      <RaceSection title="🚤 경정" races={displayRaces.boat} data-testid="race-section-boat" />
    </div>
  );
}