import { RunnerVM } from '@/lib/view-models/bookVM';
import RunnerRowExpert from './RunnerRowExpert';

interface RunnerTableExpertProps {
  runners: RunnerVM[];
}

const RunnerTableExpert = ({ runners }: RunnerTableExpertProps) => {
  const sorted = [...runners].sort((a, b) => a.number - b.number);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-base">
        <thead className="bg-gray-100 text-sm font-semibold text-gray-800">
          <tr>
            <th className="px-2 py-2 text-center">번호</th>
            <th className="px-2 py-2">마/선수</th>
            <th className="px-2 py-2">기수</th>
            <th className="px-2 py-2">조교사/소속</th>
            <th className="px-2 py-2 text-center">오즈</th>
            <th className="px-2 py-2 text-center">인기</th>
            <th className="px-2 py-2">통산 요약</th>
            <th className="px-2 py-2">최근폼(8)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((runner) => (
            <RunnerRowExpert key={runner.number} runner={runner} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RunnerTableExpert;
