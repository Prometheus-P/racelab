import { memo } from 'react';
import { RunnerVM, BookViewMode } from '@/lib/view-models/bookVM';
import FormLinesCell from './FormLinesCell';

interface RunnerRowDenseProps {
  runner: RunnerVM;
  viewMode: BookViewMode;
}

export const RunnerRowDense = memo(function RunnerRowDense({ runner, viewMode }: RunnerRowDenseProps) {
  const maxFormLines = viewMode === 'expert' ? 8 : 5;

  return (
    <tr className="align-top text-base">
      <td className="whitespace-nowrap px-2 py-2 text-center font-semibold text-gray-900">{runner.number}</td>
      <td className="min-w-[180px] px-2 py-2">
        <div className="font-bold text-gray-900">{runner.name}</div>
        <div className="text-sm text-gray-600">
          {runner.age ? `${runner.age}세` : '연령 정보 없음'}
          {runner.sex && <span className="ml-1">({runner.sex})</span>}
        </div>
      </td>
      <td className="min-w-[120px] px-2 py-2 text-sm text-gray-800">{runner.jockey ?? '기수 준비중'}</td>
      {viewMode === 'expert' && (
        <td className="min-w-[140px] px-2 py-2 text-sm text-gray-800">{runner.trainer ?? '조교사 정보 없음'}</td>
      )}
      <td className="whitespace-nowrap px-2 py-2 text-center text-sm font-semibold text-gray-900">
        {runner.odds ? runner.odds.toFixed(2) : '-'}
      </td>
      <td className="whitespace-nowrap px-2 py-2 text-center text-sm text-gray-700">
        {runner.popularity ?? '대기'}
      </td>
      <td className="px-2 py-2">
        <FormLinesCell formLines={runner.formLines} maxLines={maxFormLines} />
      </td>
    </tr>
  );
});

export default RunnerRowDense;
