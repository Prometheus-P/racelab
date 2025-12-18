import Link from 'next/link';
import { RecentRaceVM } from '@/lib/view-models/entityVM';

interface RecentRacesTableProps {
  races: RecentRaceVM[];
}

const RecentRacesTable = ({ races }: RecentRacesTableProps) => {
  if (races.length === 0) {
    return <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-600">최근 경주 데이터 수집중</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-base">
        <thead className="bg-gray-100 text-sm font-semibold text-gray-800">
          <tr>
            <th className="px-3 py-2">일자</th>
            <th className="px-3 py-2">경기</th>
            <th className="px-3 py-2">장소</th>
            <th className="px-3 py-2">결과</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {races.map((race) => (
            <tr key={race.id} className="text-base leading-6">
              <td className="px-3 py-2 whitespace-nowrap">{race.date}</td>
              <td className="px-3 py-2">
                <Link href={`/race/${race.id}`} className="text-primary hover:underline">
                  {race.title}
                </Link>
              </td>
              <td className="px-3 py-2">{race.track}</td>
              <td className="px-3 py-2">{race.finish ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentRacesTable;
