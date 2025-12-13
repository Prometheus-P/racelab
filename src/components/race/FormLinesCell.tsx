import { FormLine } from '@/lib/view-models/bookVM';

interface FormLinesCellProps {
  formLines: FormLine[];
  maxLines: number;
}

export function FormLinesCell({ formLines, maxLines }: FormLinesCellProps) {
  if (!formLines || formLines.length === 0) {
    return <span className="text-sm text-gray-500">기록 수집중</span>;
  }

  const displayLines = formLines.slice(-maxLines).reverse();

  return (
    <div className="flex flex-wrap gap-1">
      {displayLines.map((line, index) => (
        <span
          key={`${line.finish}-${index}`}
          className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm"
          title={
            [line.date, line.venue, line.distance, line.time]
              .filter(Boolean)
              .join(' • ') || '최근 기록'
          }
        >
          {line.finish ?? '-'}
        </span>
      ))}
    </div>
  );
}

export default FormLinesCell;
