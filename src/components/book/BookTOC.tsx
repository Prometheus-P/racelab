import Link from 'next/link';
import { VenueVM } from '@/lib/view-models/bookVM';

interface BookTOCProps {
  venues: VenueVM[];
}

const typeLabel: Record<VenueVM['type'], string> = {
  horse: '경마',
  cycle: '경륜',
  boat: '경정',
};

export function BookTOC({ venues }: BookTOCProps) {
  if (venues.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-600">
        오늘 데이터 수집중
      </div>
    );
  }

  const grouped = venues.reduce<Record<VenueVM['type'], VenueVM[]>>(
    (acc, venue) => {
      const list = acc[venue.type] ?? [];
      acc[venue.type] = [...list, venue];
      return acc;
    },
    { horse: [], cycle: [], boat: [] }
  );

  return (
    <nav aria-label="책 목차" className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-bold text-gray-900">목차</h2>
      <div className="space-y-4 text-sm">
        {(Object.keys(grouped) as (keyof typeof grouped)[]).map((typeKey) => {
          const venuesForType = grouped[typeKey];
          if (!venuesForType || venuesForType.length === 0) {
            return null;
          }

          return (
            <div key={typeKey} className="space-y-2">
              <div className="text-base font-semibold text-gray-800">{typeLabel[typeKey]}</div>
              <ul className="space-y-1 pl-3" role="list">
                {venuesForType.map((venue) => (
                  <li key={venue.id} className="leading-tight">
                    <div className="font-medium text-gray-700">{venue.name}</div>
                    <ul className="ml-2 space-y-1 border-l border-gray-200 pl-3" role="list">
                      {venue.races.length > 0 ? (
                        venue.races.map((race) => (
                          <li key={race.id}>
                            <Link
                              href={`#race-${race.id}`}
                              className="text-gray-600 transition-colors hover:text-primary"
                            >
                              {race.title ?? race.id}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">경주 편성 대기</li>
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export default BookTOC;
