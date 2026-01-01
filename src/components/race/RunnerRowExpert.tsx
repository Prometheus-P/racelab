import { memo } from 'react';
import { RunnerVM } from '@/lib/view-models/bookVM';
import FormLinesCell from './FormLinesCell';

interface RunnerRowExpertProps {
  runner: RunnerVM;
}

const RunnerRowExpert = memo(function RunnerRowExpert({ runner }: RunnerRowExpertProps) {
  const formLines = runner.formLines.length > 0 ? runner.formLines : Array(8).fill({ finish: '기록 수집중' });

  return (
    <tr className="text-base leading-6">
      <td className="px-2 py-2 text-center font-semibold">{runner.number}</td>
      <td className="px-2 py-2 font-semibold">{runner.name}</td>
      <td className="px-2 py-2">{runner.jockey ?? '기수 정보 없음'}</td>
      <td className="px-2 py-2">{runner.trainer ?? '소속 정보 없음'}</td>
      <td className="px-2 py-2 text-center">{runner.odds ?? '-'}</td>
      <td className="px-2 py-2 text-center">{runner.popularity ?? '-'}</td>
      <td className="px-2 py-2 text-sm text-gray-700">최근 {formLines.length}회 출주 기록</td>
      <td className="px-2 py-2 text-sm">
        <FormLinesCell formLines={formLines} maxLines={8} />
      </td>
    </tr>
  );
});

export default RunnerRowExpert;
