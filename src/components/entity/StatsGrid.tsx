import { EntityProfileVM } from '@/lib/view-models/entityVM';

interface StatsGridProps {
  profile: EntityProfileVM;
}

const StatCard = ({ label, value }: { label: string; value: number | string }) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
  </div>
);

const StatsGrid = ({ profile }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="출주" value={profile.stats.totalStarts} />
      <StatCard label="승" value={profile.stats.wins} />
      <StatCard label="입상" value={profile.stats.top3} />
      <StatCard label="소속" value={profile.affiliations ?? '정보 수집중'} />
    </div>
  );
};

export default StatsGrid;
