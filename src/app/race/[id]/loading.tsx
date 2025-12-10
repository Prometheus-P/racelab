// src/app/race/[id]/loading.tsx
import { RaceDetailPageSkeleton } from '@/components/race-detail';

export default function RaceDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back navigation skeleton */}
      <div className="animate-pulse">
        <div className="h-8 w-24 rounded bg-gray-200" />
      </div>
      <RaceDetailPageSkeleton />
    </div>
  );
}
