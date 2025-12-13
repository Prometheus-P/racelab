import RaceCardDense from '@/components/book/RaceCardDense';
import { VenueVM } from '@/lib/view-models/bookVM';
import { BookViewMode } from '@/lib/view-models/bookVM';

interface VenueSectionProps {
  venue: VenueVM;
  viewMode: BookViewMode;
}

export function VenueSection({ venue, viewMode }: VenueSectionProps) {
  return (
    <section id={`venue-${venue.id}`} className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div>
          <p className="text-sm font-medium text-gray-500">{venue.type === 'horse' ? '경마' : venue.type === 'cycle' ? '경륜' : '경정'}</p>
          <h2 className="text-2xl font-bold text-gray-900">{venue.name}</h2>
        </div>
        <div className="text-sm text-gray-600">{venue.races.length}개 경주</div>
      </div>
      <div className="space-y-4">
        {venue.races.length > 0 ? (
          venue.races.map((race) => <RaceCardDense key={race.id} race={race} viewMode={viewMode} />)
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-600">편성된 경주가 없습니다.</div>
        )}
      </div>
    </section>
  );
}

export default VenueSection;
