// src/app/race/[id]/loading.tsx

export default function RaceDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back navigation skeleton */}
      <div className="animate-pulse">
        <div className="h-8 w-24 rounded bg-gray-200" />
      </div>
      {/* Content skeleton */}
      <div className="animate-pulse space-y-4">
        <div className="h-48 rounded-xl bg-gray-200" />
        <div className="h-32 rounded-xl bg-gray-200" />
        <div className="h-64 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
