import Link from 'next/link';
import { Metadata } from 'next';
import { formatDate, getKoreanDate } from '@/lib/utils/date';

export const metadata: Metadata = {
  title: '레이스 캘린더 - RaceLab',
  description: '과거/미래 출전표와 결과를 날짜별로 살펴보세요.',
};

const buildDateList = () => {
  const today = getKoreanDate();
  const days: string[] = [];
  for (let offset = -3; offset <= 7; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    days.push(formatDate(date));
  }
  return days;
};

export default function CalendarPage() {
  const dates = buildDateList();

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <p className="text-sm text-gray-500">출전표/결과</p>
        <h1 className="text-2xl font-bold text-gray-900">레이스 캘린더</h1>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {dates.map((date) => (
          <div key={date} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-lg font-semibold text-gray-900">{date}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <Link href={`/book/${date}`} className="text-primary hover:underline">
                북모드
              </Link>
              <Link href={`/book/${date}/서울`} className="text-primary hover:underline">
                서울 경마장
              </Link>
              <Link href={`/results?date=${date}`} className="text-primary hover:underline">
                결과
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
