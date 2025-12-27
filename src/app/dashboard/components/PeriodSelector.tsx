'use client';

export type Period = '1month' | '3months' | '6months';

interface PeriodSelectorProps {
  selected: Period;
  onSelect: (period: Period) => void;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: '1month', label: '1개월' },
  { value: '3months', label: '3개월' },
  { value: '6months', label: '6개월' },
];

export function PeriodSelector({ selected, onSelect }: PeriodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-title-small font-semibold text-neutral-text-primary">분석 기간</h3>
      <div className="flex gap-2">
        {PERIODS.map((period) => (
          <button
            key={period.value}
            onClick={() => onSelect(period.value)}
            className={`flex-1 rounded-lg py-2.5 text-center text-label-large font-medium transition-all ${
              selected === period.value
                ? 'bg-horse text-white'
                : 'bg-surface-dim text-neutral-text-secondary hover:bg-neutral-border hover:text-neutral-text-primary'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}
