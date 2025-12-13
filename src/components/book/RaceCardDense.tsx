import RunnerTableDense from '@/components/race/RunnerTableDense';
import { RaceVM, BookViewMode } from '@/lib/view-models/bookVM';
import AbbrevTooltip from '@/components/shared/AbbrevTooltip';

interface RaceCardDenseProps {
  race: RaceVM;
  viewMode: BookViewMode;
}

export function RaceCardDense({ race, viewMode }: RaceCardDenseProps) {
  return (
    <article
      id={`race-${race.id}`}
      className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-3 shadow-inner"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">{race.startTime}</span>
          <div>
            <div className="text-lg font-bold text-gray-900">{race.title ?? '경주 정보'}</div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              {race.grade && <AbbrevTooltip abbr="G" className="text-gray-700">{race.grade}</AbbrevTooltip>}
              {race.distance && (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">{race.distance}m</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">번호 순 정렬</div>
      </header>
      <RunnerTableDense runners={race.runners} viewMode={viewMode} />
    </article>
  );
}

export default RaceCardDense;
