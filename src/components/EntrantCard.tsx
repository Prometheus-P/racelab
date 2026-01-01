'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Star, StarOff } from 'lucide-react';

import type { EntrantData, EntrantStats } from '@/types';
import Badge from '@/components/ui/Badge';
import { LazyEntrantRadarChart } from '@/components/charts';

interface EntrantCardProps {
  entrant: EntrantData;
  onFavoriteChange?: (id: string, favorite: boolean) => void;
  onExpandChange?: (id: string, expanded: boolean) => void;
}

const HIGH_WIN_RATE_THRESHOLD = 50;

const statLabels: Record<keyof EntrantStats, string> = {
  speed: 'Speed',
  stamina: 'Stamina',
  recentWinRate: 'Recent Win Rate',
  condition: 'Condition',
};

function clampStat(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}

function toRadarData(stats: EntrantStats | undefined) {
  // 데이터 누락/이상치에 대비하여 0~100 사이 값으로 보정
  const safeStats: EntrantStats = {
    speed: clampStat(stats?.speed),
    stamina: clampStat(stats?.stamina),
    recentWinRate: clampStat(stats?.recentWinRate),
    condition: clampStat(stats?.condition),
  };

  return (Object.keys(safeStats) as (keyof EntrantStats)[]).map((key) => ({
    metric: statLabels[key],
    score: safeStats[key],
  }));
}

function resolveBadge(entrant: EntrantData): string | null {
  const badges = entrant.badges ?? [];
  const winRate = entrant.stats?.recentWinRate;
  const speed = entrant.stats?.speed;

  if (badges.includes('highWinRate') || (typeof winRate === 'number' && winRate >= HIGH_WIN_RATE_THRESHOLD)) {
    return 'High Win Rate';
  }

  if (badges.includes('hotPick') || (typeof speed === 'number' && speed >= 70)) {
    return 'Hot Pick';
  }

  return null;
}

export default function EntrantCard({ entrant, onExpandChange, onFavoriteChange }: EntrantCardProps) {
  const [expanded, setExpanded] = useState(false);
  // Uncontrolled fallback state (only used when onFavoriteChange is not provided)
  const [uncontrolledFavorite, setUncontrolledFavorite] = useState(Boolean(entrant.favorite));
  const headingId = `entrant-${entrant.id}-title`;

  // Use prop directly when controlled, fallback to local state when uncontrolled
  const isFavorite = onFavoriteChange ? Boolean(entrant.favorite) : uncontrolledFavorite;

  const radarData = useMemo(() => toRadarData(entrant.stats), [entrant.stats]);
  const badgeLabel = useMemo(() => resolveBadge(entrant), [entrant]);

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    onExpandChange?.(entrant.id, next);
  };

  const toggleFavorite = () => {
    const next = !isFavorite;
    if (onFavoriteChange) {
      onFavoriteChange(entrant.id, next);
    } else {
      setUncontrolledFavorite(next);
    }
  };

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg transition hover:border-slate-700">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={toggleExpand}
          aria-expanded={expanded}
          aria-controls={`entrant-${entrant.id}-details`}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-semibold text-slate-900 shadow-inner">
            {entrant.number}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wide text-slate-400">{entrant.raceType}</p>
            <div className="flex flex-wrap items-center gap-2">
              <h3 id={headingId} className="text-lg font-semibold text-white">
                {entrant.name}
              </h3>
              {badgeLabel ? <Badge variant="secondary">{badgeLabel}</Badge> : null}
            </div>
            {entrant.odds ? (
              <p className="text-sm text-emerald-300">배당률 {entrant.odds.toFixed(2)}</p>
            ) : (
              <p className="text-sm text-slate-400">배당률 정보 준비중</p>
            )}
          </div>
        </button>
        <div className="flex items-center gap-2 self-end sm:self-start">
          <button
            type="button"
            aria-label={isFavorite ? '즐겨찾기 제거' : '즐겨찾기 추가'}
            onClick={toggleFavorite}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800/80 text-amber-300 transition hover:border-amber-400 hover:text-amber-200"
          >
            {isFavorite ? <Star className="h-5 w-5 fill-amber-300" /> : <StarOff className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={toggleExpand}
            aria-hidden="true"
            tabIndex={-1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800/80 text-white transition hover:border-blue-500 hover:text-blue-200"
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-56 w-full">
          <LazyEntrantRadarChart stats={entrant.stats} />
        </div>

        <div className="rounded-xl bg-slate-800/60 p-3">
          <p className="text-sm font-semibold text-white">주요 지표</p>
          <div className="mt-3 space-y-2">
            {radarData.map((item) => (
              <div key={item.metric} className="flex items-center justify-between text-sm text-slate-200">
                <span>{item.metric}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-28 rounded-full bg-slate-700">
                    <div
                      className="h-2 rounded-full bg-sky-400"
                      style={{ width: `${item.score}%` }}
                      aria-label={`${item.metric} ${item.score}`}
                    />
                  </div>
                  <span className="w-10 text-right text-xs text-slate-300">{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {expanded ? (
        <div
          id={`entrant-${entrant.id}-details`}
          className="space-y-2 rounded-xl bg-slate-800/60 p-3"
          data-testid="entrant-history"
          aria-live="polite"
          role="region"
          aria-labelledby={headingId}
        >
          <p className="text-sm font-semibold text-white">최근 전적</p>
          {entrant.history && entrant.history.length > 0 ? (
            <ul className="space-y-2 text-sm text-slate-200">
              {entrant.history.map((item) => (
                <li key={`${item.date}-${item.result ?? 'unknown'}`} className="rounded-lg bg-slate-900/70 p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.date}</span>
                    <span className="text-xs text-slate-400">{item.track ?? '트랙 정보 없음'}</span>
                  </div>
                  <p className="text-xs text-emerald-200">{item.result ?? '결과 데이터 업데이트 중'}</p>
                  {item.notes ? <p className="text-xs text-slate-300">{item.notes}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">최근 전적 데이터가 없어 업데이트 중입니다.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}
