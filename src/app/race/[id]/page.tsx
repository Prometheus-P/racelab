// src/app/race/[id]/page.tsx
import React from 'react';
import Link from 'next/link';
import { fetchRaceById } from '@/lib/api';
import { getRaceTypeEmoji } from '@/lib/utils/ui';
import { Entry, RaceType } from '@/types';
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { id: string }
}

// Race type configuration
const raceTypeConfig: Record<RaceType, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  horse: {
    label: '경마',
    color: 'text-horse',
    bgColor: 'bg-horse/5',
    borderColor: 'border-horse',
  },
  cycle: {
    label: '경륜',
    color: 'text-cycle',
    bgColor: 'bg-cycle/5',
    borderColor: 'border-cycle',
  },
  boat: {
    label: '경정',
    color: 'text-boat',
    bgColor: 'bg-boat/5',
    borderColor: 'border-boat',
  },
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const race = await fetchRaceById(params.id);

  if (!race) {
    return {
      title: '경주 정보 - KRace',
    }
  }

  return {
    title: `${race.track} 제${race.raceNo}경주 - KRace`,
    description: `${race.track} 제${race.raceNo}경주 경마 상세 정보, 출전표, 배당률을 확인하세요.`,
  }
}

// Entry row component for desktop table
const EntryRow = ({ entry, raceType }: { entry: Entry; raceType: RaceType }) => {
  const config = raceTypeConfig[raceType];

  return (
    <tr className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
      <td className="p-3 text-center">
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor} ${config.color} font-bold`}>
          {entry.no}
        </span>
      </td>
      <td className="p-3 font-semibold text-gray-900">{entry.name}</td>
      <td className="p-3 text-gray-700">{entry.jockey || '-'}</td>
      <td className="p-3 text-gray-700">{entry.trainer || '-'}</td>
      <td className="p-3 text-center text-gray-700">{entry.age || '-'}</td>
      <td className="p-3 text-center text-gray-700">{entry.weight ? `${entry.weight}kg` : '-'}</td>
      <td className="p-3 text-gray-600 font-mono text-xs">{entry.recentRecord || '-'}</td>
    </tr>
  );
};

// Mobile entry card component
const EntryCard = ({ entry, raceType }: { entry: Entry; raceType: RaceType }) => {
  const config = raceTypeConfig[raceType];

  return (
    <article
      className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor}`}
      aria-label={`${entry.no}번 ${entry.name}`}
    >
      <div className="flex items-start gap-3">
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-white ${config.color} font-bold text-lg shadow-sm`}>
          {entry.no}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{entry.name}</h3>
          <div className="mt-1 text-sm text-gray-600 space-y-0.5">
            {entry.jockey && <p>기수: {entry.jockey}</p>}
            {entry.trainer && <p>조교사: {entry.trainer}</p>}
            <div className="flex gap-4 text-xs text-gray-500">
              {entry.age && <span>연령: {entry.age}</span>}
              {entry.weight && <span>중량: {entry.weight}kg</span>}
            </div>
          </div>
        </div>
        {entry.odds && (
          <div className="text-right">
            <span className="text-xs text-gray-500">단승</span>
            <p className={`text-lg font-bold ${config.color}`}>
              {entry.odds}
              <span className="text-xs font-normal ml-0.5">배</span>
            </p>
          </div>
        )}
      </div>
    </article>
  );
};

// Not found component
const RaceNotFound = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
      <svg
        className="w-10 h-10 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h1 className="text-xl font-bold text-gray-900 mb-2">
      경주 정보를 찾을 수 없습니다
    </h1>
    <p className="text-gray-500 mb-6">
      요청하신 경주 정보가 존재하지 않거나 삭제되었습니다.
    </p>
    <Link
      href="/"
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      홈으로 돌아가기
    </Link>
  </div>
);

export default async function RaceDetailPage({ params }: { params: { id: string } }) {
  const race = await fetchRaceById(params.id);

  if (!race) {
    return <RaceNotFound />;
  }

  const config = raceTypeConfig[race.type];
  const raceTitle = `${race.track} 제${race.raceNo}경주`;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <nav aria-label="브레드크럼">
        <Link
          href={`/?tab=${race.type}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded px-1 -ml-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {config.label} 목록으로
        </Link>
      </nav>

      {/* Race header */}
      <header className={`bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 ${config.borderColor}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4" data-testid="race-info">
          <div className="flex items-center gap-4">
            <span className="text-4xl md:text-5xl" aria-hidden="true">
              {getRaceTypeEmoji(race.type)}
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
                {race.grade && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                    {race.grade}
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {raceTitle}
                {race.distance && (
                  <span className="ml-2 text-gray-500 font-normal">
                    ({race.distance.toLocaleString()}m)
                  </span>
                )}
              </h1>
            </div>
          </div>
          <div className="md:ml-auto text-left md:text-right">
            <p className="text-sm text-gray-500 mb-1">출발 시간</p>
            <time
              dateTime={race.startTime}
              className={`text-2xl md:text-3xl font-bold font-mono ${config.color}`}
            >
              {race.startTime}
            </time>
          </div>
        </div>
      </header>

      {/* Entries section */}
      <section
        className="bg-white rounded-xl shadow-sm overflow-hidden"
        data-testid="entries"
        aria-labelledby="entries-heading"
      >
        <div className="p-4 md:p-6 border-b border-gray-100">
          <h2 id="entries-heading" className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span aria-hidden="true">📋</span>
            출전표
            <span className="text-sm font-normal text-gray-500">
              ({race.entries.length}두/명)
            </span>
          </h2>
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              {raceTitle} 출전표 - {race.entries.length}두/명 참가
            </caption>
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th scope="col" className="p-3 text-center font-medium text-gray-700 w-16">번호</th>
                <th scope="col" className="p-3 text-left font-medium text-gray-700">마명/선수명</th>
                <th scope="col" className="p-3 text-left font-medium text-gray-700">기수</th>
                <th scope="col" className="p-3 text-left font-medium text-gray-700">조교사</th>
                <th scope="col" className="p-3 text-center font-medium text-gray-700 w-16">연령</th>
                <th scope="col" className="p-3 text-center font-medium text-gray-700 w-24">부담중량</th>
                <th scope="col" className="p-3 text-left font-medium text-gray-700">최근성적</th>
              </tr>
            </thead>
            <tbody>
              {race.entries.map(entry => (
                <EntryRow key={entry.no} entry={entry} raceType={race.type} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden p-4 space-y-3">
          {race.entries.map(entry => (
            <EntryCard key={entry.no} entry={entry} raceType={race.type} />
          ))}
        </div>
      </section>

      {/* Odds section */}
      <section
        className="bg-white p-4 md:p-6 rounded-xl shadow-sm"
        data-testid="odds"
        aria-labelledby="odds-heading"
      >
        <h2 id="odds-heading" className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span aria-hidden="true">💰</span>
          단승 배당률
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {race.entries.map(entry => (
            <article
              key={entry.no}
              className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor} hover:shadow-sm transition-shadow`}
              aria-label={`${entry.no}번 ${entry.name} 배당률: ${entry.odds ? `${entry.odds}배` : '미정'}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 truncate mr-2">
                  <span className={`${config.color} font-bold`}>{entry.no}.</span> {entry.name}
                </span>
                <span className={`text-lg font-bold tabular-nums ${config.color} flex-shrink-0`}>
                  {entry.odds ? (
                    <>
                      {entry.odds}
                      <span className="text-xs font-normal ml-0.5">배</span>
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
