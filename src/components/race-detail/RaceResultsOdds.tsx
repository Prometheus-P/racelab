// src/components/race-detail/RaceResultsOdds.tsx
'use client';

import React from 'react';
import { Race, RaceType, RaceResult, Dividend, DividendType } from '@/types';

// Race type configuration
const raceTypeConfig: Record<
  RaceType,
  {
    color: string;
    borderColor: string;
  }
> = {
  horse: {
    color: 'text-horse',
    borderColor: 'border-horse',
  },
  cycle: {
    color: 'text-cycle',
    borderColor: 'border-cycle',
  },
  boat: {
    color: 'text-boat',
    borderColor: 'border-boat',
  },
};

// Rank badge styling
const rankStyles: Record<number, string> = {
  1: 'bg-yellow-400 text-yellow-900',
  2: 'bg-gray-300 text-gray-700',
  3: 'bg-orange-300 text-orange-900',
};

// Dividend type labels
const dividendLabels: Record<DividendType, string> = {
  win: '단승',
  place: '복승',
  quinella: '쌍승',
};

interface RaceResultsOddsProps {
  race: Race;
  results: RaceResult[];
  dividends: Dividend[];
  className?: string;
}

export default function RaceResultsOdds({
  race,
  results,
  dividends,
  className = '',
}: RaceResultsOddsProps) {
  const config = raceTypeConfig[race.type];

  // Status-based messages
  if (race.status === 'upcoming') {
    return (
      <section
        className={`rounded-xl bg-white p-4 shadow-sm md:p-6 border-l-4 ${config.borderColor} ${className}`}
        data-testid="race-results-odds"
      >
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <span aria-hidden="true">🏆</span>
          경주 결과
        </h2>
        <p className="py-8 text-center text-gray-500">아직 결과가 없습니다. 경주 시작 후 확인해 주세요.</p>
      </section>
    );
  }

  if (race.status === 'live') {
    return (
      <section
        className={`rounded-xl bg-white p-4 shadow-sm md:p-6 border-l-4 ${config.borderColor} ${className}`}
        data-testid="race-results-odds"
      >
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <span aria-hidden="true">🏆</span>
          경주 결과
        </h2>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
          <p className="text-gray-500">경주 진행 중입니다. 결과가 곧 업데이트됩니다.</p>
        </div>
      </section>
    );
  }

  if (race.status === 'canceled') {
    return (
      <section
        className={`rounded-xl bg-white p-4 shadow-sm md:p-6 border-l-4 ${config.borderColor} ${className}`}
        data-testid="race-results-odds"
      >
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <span aria-hidden="true">🏆</span>
          경주 결과
        </h2>
        <p className="py-8 text-center text-gray-500">취소된 경주입니다.</p>
      </section>
    );
  }

  // Finished race but no results yet
  if (results.length === 0) {
    return (
      <section
        className={`rounded-xl bg-white p-4 shadow-sm md:p-6 border-l-4 ${config.borderColor} ${className}`}
        data-testid="race-results-odds"
      >
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <span aria-hidden="true">🏆</span>
          경주 결과
        </h2>
        <p className="py-8 text-center text-gray-500">결과 미집계 - 잠시 후 다시 확인해 주세요.</p>
      </section>
    );
  }

  // Get dividends by type
  const getDividend = (type: DividendType): Dividend | undefined => {
    return dividends.find((d) => d.type === type);
  };

  // All expected dividend types
  const allDividendTypes: DividendType[] = ['win', 'place', 'quinella'];

  return (
    <section
      className={`overflow-hidden rounded-xl bg-white shadow-sm border-l-4 ${config.borderColor} ${className}`}
      data-testid="race-results-odds"
    >
      {/* Results Section */}
      <div className="border-b border-gray-100 p-4 md:p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <span aria-hidden="true">🏆</span>
          경주 결과
        </h2>
      </div>

      <div className="p-4 md:p-6">
        {/* Results Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th scope="col" className="w-20 p-3 text-center font-medium text-gray-700">
                  순위
                </th>
                <th scope="col" className="w-20 p-3 text-center font-medium text-gray-700">
                  번호
                </th>
                <th scope="col" className="p-3 text-left font-medium text-gray-700">
                  {race.type === 'horse' ? '마명' : '선수명'}
                </th>
                <th scope="col" className="w-32 p-3 text-right font-medium text-gray-700">
                  배당금
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <ResultRow key={result.rank} result={result} raceType={race.type} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Dividends Section */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
            <span aria-hidden="true">💰</span>
            배당금
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {allDividendTypes.map((type) => {
              const dividend = getDividend(type);
              return (
                <DividendCard
                  key={type}
                  type={type}
                  dividend={dividend}
                  raceType={race.type}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// Result row component
function ResultRow({ result, raceType }: { result: RaceResult; raceType: RaceType }) {
  const config = raceTypeConfig[raceType];
  const rankStyle = rankStyles[result.rank] || 'bg-gray-100 text-gray-600';

  return (
    <tr className="border-b transition-colors last:border-b-0 hover:bg-gray-50">
      <td className="p-3 text-center">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold ${rankStyle}`}
        >
          {result.rank}
        </span>
      </td>
      <td className={`p-3 text-center font-bold ${config.color}`}>{result.no}번</td>
      <td className="p-3">
        <span className="font-semibold text-gray-900">{result.name}</span>
        {result.jockey && (
          <span className="ml-2 text-sm text-gray-500">({result.jockey})</span>
        )}
      </td>
      <td className="p-3 text-right">
        {result.payout ? (
          <span className={`font-bold ${config.color}`}>
            {result.payout.toLocaleString()}
            <span className="ml-1 text-xs font-normal text-gray-500">원</span>
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
    </tr>
  );
}

// Dividend card component
function DividendCard({
  type,
  dividend,
  raceType,
}: {
  type: DividendType;
  dividend: Dividend | undefined;
  raceType: RaceType;
}) {
  const config = raceTypeConfig[raceType];
  const label = dividendLabels[type];

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      {dividend ? (
        <>
          <p className={`text-lg font-bold ${config.color}`}>
            {dividend.amount.toLocaleString()}
            <span className="ml-1 text-xs font-normal text-gray-500">원</span>
          </p>
          <p className="text-xs text-gray-500">
            {dividend.entries.join('-')}번
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-400">미발매</p>
      )}
    </div>
  );
}
