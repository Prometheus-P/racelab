// src/components/QuickStats.tsx
import React from 'react';
import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules } from '@/lib/api';
import { getTodayYYYYMMDD } from '@/lib/utils/date';

// Helper component for individual stats
const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default async function QuickStats() {
  const rcDate = getTodayYYYYMMDD();
  const [horseRaces, cycleRaces, boatRaces] = await Promise.all([
    fetchHorseRaceSchedules(rcDate),
    fetchCycleRaceSchedules(rcDate),
    fetchBoatRaceSchedules(rcDate),
  ]);

  const stats = {
    horse: horseRaces.length,
    cycle: cycleRaces.length,
    boat: boatRaces.length,
    total: horseRaces.length + cycleRaces.length + boatRaces.length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="총 경주" value={stats.total} />
      <StatCard label="경마" value={stats.horse} />
      <StatCard label="경륜" value={stats.cycle} />
      <StatCard label="경정" value={stats.boat} />
    </div>
  );
}