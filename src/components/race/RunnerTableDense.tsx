import { BookViewMode, RunnerVM } from '@/lib/view-models/bookVM';
import RunnerRowDense from './RunnerRowDense';

interface RunnerTableDenseProps {
  runners: RunnerVM[];
  viewMode: BookViewMode;
}

export function RunnerTableDense({ runners, viewMode }: RunnerTableDenseProps) {
  const sortedRunners = [...runners].sort((a, b) => a.number - b.number);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-base">
        <thead className="bg-gray-100 text-sm font-semibold text-gray-800">
          <tr>
            <th scope="col" className="px-2 py-2 text-center">번호</th>
            <th scope="col" className="px-2 py-2">마/선수</th>
            <th scope="col" className="px-2 py-2">기수</th>
            {viewMode === 'expert' && <th scope="col" className="px-2 py-2">조교사/소속</th>}
            <th scope="col" className="px-2 py-2 text-center">오즈</th>
            <th scope="col" className="px-2 py-2 text-center">인기</th>
            <th scope="col" className="px-2 py-2">최근폼</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedRunners.map((runner) => (
            <RunnerRowDense key={runner.number} runner={runner} viewMode={viewMode} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RunnerTableDense;
