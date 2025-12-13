import { DataFreshness } from '@/lib/view-models/bookVM';

interface DataFreshnessBadgeProps {
  freshness: DataFreshness;
  updatedAt?: string;
}

const labelMap: Record<DataFreshness, string> = {
  realtime: 'REALTIME',
  snapshot: 'SNAPSHOT',
  delayed: 'DELAYED',
};

const colorMap: Record<DataFreshness, string> = {
  realtime: 'bg-green-100 text-green-700 border-green-200',
  snapshot: 'bg-blue-50 text-blue-700 border-blue-200',
  delayed: 'bg-amber-50 text-amber-700 border-amber-200',
};

export function DataFreshnessBadge({ freshness, updatedAt }: DataFreshnessBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${colorMap[freshness]}`}
      aria-label="데이터 신선도"
      title={updatedAt ? `마지막 동기화: ${updatedAt}` : undefined}
    >
      <span className="inline-block h-2 w-2 rounded-full bg-current opacity-80" aria-hidden />
      <span>{labelMap[freshness]}</span>
      {updatedAt && <time className="font-normal text-[11px] opacity-80">{updatedAt}</time>}
    </div>
  );
}

export default DataFreshnessBadge;
