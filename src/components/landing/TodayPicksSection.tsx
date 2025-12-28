'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, TrendingUp, Users, ArrowRight, Loader2, Trophy, Clock, Radio } from 'lucide-react';

interface RacePick {
  id: string;
  track: string;
  raceNumber: number;
  time: string;
  distance: string;
  entryCount: number;
  highlight: string;
  type: 'horse' | 'cycle' | 'boat';
  status: 'upcoming' | 'live' | 'finished' | 'canceled';
  grade?: string;
  winnerName?: string; // 1착 마/선수 (종료된 경주만)
}

// API 응답에서 사용되는 경주 데이터 타입
interface ApiRace {
  id?: string;
  track?: string;
  venue?: string;
  raceNumber?: number;
  raceNo?: number;
  startTime?: string;
  time?: string;
  distance?: string;
  entryCount?: number;
  entries?: Array<{ no: number; name: string; jockey?: string }>;
  status?: 'upcoming' | 'live' | 'finished' | 'canceled';
  grade?: string;
}

// 더미 데이터 (API 실패 시 fallback)
const FALLBACK_PICKS: RacePick[] = [
  {
    id: 'seoul-1r',
    track: '서울',
    raceNumber: 1,
    time: '11:00',
    distance: '1200m',
    entryCount: 12,
    highlight: '배당률 변동 활발',
    type: 'horse',
    status: 'finished',
    grade: '국6등급',
    winnerName: '파드슈발',
  },
  {
    id: 'busan-3r',
    track: '부산',
    raceNumber: 3,
    time: '12:30',
    distance: '1400m',
    entryCount: 10,
    highlight: '인기마 접전',
    type: 'horse',
    status: 'upcoming',
    grade: '국5등급',
  },
  {
    id: 'jeju-2r',
    track: '제주',
    raceNumber: 2,
    time: '13:00',
    distance: '1000m',
    entryCount: 8,
    highlight: '역배팅 기회',
    type: 'horse',
    status: 'live',
    grade: '국4등급',
  },
];

const typeColors = {
  horse: 'bg-horse-container text-horse-bold border-horse',
  cycle: 'bg-cycle-container text-cycle-bold border-cycle',
  boat: 'bg-boat-container text-boat-bold border-boat',
};

const typeLabels = {
  horse: '경마',
  cycle: '경륜',
  boat: '경정',
};

const statusConfig = {
  upcoming: { label: '예정', icon: Clock, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  live: { label: 'LIVE', icon: Radio, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  finished: { label: '종료', icon: Trophy, bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
  canceled: { label: '취소', icon: Clock, bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-500' },
};

function RaceCard({ race }: { race: RacePick }) {
  const colors = typeColors[race.type];
  const statusInfo = statusConfig[race.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="group cursor-pointer rounded-xl border border-neutral-divider bg-white p-5 transition-all hover:border-primary/30 hover:shadow-lg dark:bg-[var(--rl-surface)] dark:border-[var(--rl-border)]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-label-small font-medium ${colors}`}
          >
            {typeLabels[race.type]}
          </span>
          <span className="text-title-medium font-bold text-neutral-text-primary dark:text-[var(--rl-text-primary)]">
            {race.track} {race.raceNumber}R
          </span>
        </div>
        {/* Status Badge */}
        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-label-small font-medium ${statusInfo.bg} ${statusInfo.text}`}>
          <StatusIcon className={`h-3 w-3 ${race.status === 'live' ? 'animate-pulse' : ''}`} />
          {statusInfo.label}
        </span>
      </div>

      {/* Stats */}
      <div className="mb-3 flex items-center gap-4 text-body-small text-neutral-text-secondary dark:text-[var(--rl-text-secondary)]">
        <div className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4" />
          <span>{race.distance}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{race.entryCount}두 출전</span>
        </div>
        {race.grade && (
          <span className="text-label-small text-neutral-text-tertiary dark:text-[var(--rl-text-tertiary)]">
            {race.grade}
          </span>
        )}
      </div>

      {/* Result or Highlight */}
      {race.status === 'finished' && race.winnerName ? (
        <div className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2">
          <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-body-medium font-medium text-yellow-700 dark:text-yellow-300">
            1착: {race.winnerName}
          </span>
        </div>
      ) : (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
          race.status === 'live'
            ? 'bg-red-50 dark:bg-red-900/20'
            : 'bg-horse-container/50 dark:bg-horse-container/20'
        }`}>
          <TrendingUp className={`h-4 w-4 ${
            race.status === 'live' ? 'text-red-600 dark:text-red-400' : 'text-horse-bold'
          }`} />
          <span className={`text-body-medium font-medium ${
            race.status === 'live' ? 'text-red-700 dark:text-red-300' : 'text-horse-bold'
          }`}>
            {race.highlight}
          </span>
        </div>
      )}
    </div>
  );
}

export function TodayPicksSection() {
  const [picks, setPicks] = useState<RacePick[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchTodayRaces() {
      try {
        const response = await fetch('/api/races/horse');
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          // 실제 데이터에서 상위 3개 경주 선택
          const topRaces = data.data.slice(0, 3).map((race: ApiRace, index: number) => ({
            id: race.id || `race-${index}`,
            track: race.track || race.venue || '서울',
            raceNumber: race.raceNo || race.raceNumber || index + 1,
            time: race.startTime || race.time || '11:00',
            distance: race.distance || '1200m',
            entryCount: race.entryCount || race.entries?.length || 10,
            highlight: getHighlight(index, race.status),
            type: 'horse' as const,
            status: race.status || 'upcoming',
            grade: race.grade,
            winnerName: race.status === 'finished' && race.entries?.[0]?.name,
          }));
          setPicks(topRaces);
        } else {
          setPicks(FALLBACK_PICKS);
        }
      } catch {
        setError(true);
        setPicks(FALLBACK_PICKS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTodayRaces();
  }, []);

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-headline-medium font-bold text-neutral-text-primary">
              오늘의 주목 경주
            </h2>
            <p className="mt-1 text-body-medium text-neutral-text-secondary">
              지금 진행 중인 경주 중 분석하기 좋은 경주를 선별했습니다
            </p>
          </div>
          <Link
            href="/races"
            className="group inline-flex items-center gap-2 text-body-medium font-medium text-primary hover:underline"
          >
            전체 경주 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-horse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {picks.map((race) => (
              <Link key={race.id} href={`/race/${race.id}`}>
                <RaceCard race={race} />
              </Link>
            ))}
          </div>
        )}

        {/* Error notice (subtle) */}
        {error && (
          <p className="mt-4 text-center text-label-small text-neutral-text-secondary">
            * 실시간 데이터 대신 샘플 데이터를 표시 중입니다
          </p>
        )}
      </div>
    </section>
  );
}

// Helper function to generate highlight text based on status
function getHighlight(index: number, status?: string): string {
  if (status === 'finished') {
    return '경주 종료';
  }
  if (status === 'live') {
    return '진행 중';
  }
  const highlights = [
    '배당률 변동 활발',
    '인기마 접전',
    '역배팅 기회',
    '고배당 가능성',
    '안정적 경주',
  ];
  return highlights[index % highlights.length];
}
