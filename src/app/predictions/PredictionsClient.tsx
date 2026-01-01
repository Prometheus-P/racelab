/**
 * Predictions Client Component
 *
 * 오늘의 경주 예측 표시 (클라이언트 사이드)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PredictionCard, PredictionCardSkeleton } from '@/components/predictions';
import { M3Card } from '@/components/ui/M3Card';
import type { HorsePrediction } from '@/types/prediction';

interface PredictionsClientProps {
  date: string;
}

interface RaceWithPredictions {
  raceId: string;
  raceNo: number;
  raceName: string;
  track: string;
  distance: number;
  predictions: HorsePrediction[];
}

export function PredictionsClient({ date }: PredictionsClientProps) {
  const [races, setRaces] = useState<RaceWithPredictions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>('all');

  useEffect(() => {
    fetchPredictions();
  }, [date]);

  async function fetchPredictions() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/predictions?date=${date}`);
      const data = await response.json();

      if (data.success && data.data) {
        setRaces(data.data);
      } else {
        // Mock 데이터 사용 (API 미구현 시)
        setRaces(generateMockRaces());
      }
    } catch (err) {
      console.error('Failed to fetch predictions:', err);
      // Mock 데이터로 폴백
      setRaces(generateMockRaces());
    } finally {
      setLoading(false);
    }
  }

  const tracks = ['all', ...Array.from(new Set(races.map((r) => r.track)))];
  const filteredRaces =
    selectedTrack === 'all'
      ? races
      : races.filter((r) => r.track === selectedTrack);

  if (loading) {
    return <PredictionsLoading />;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchPredictions}
          className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (races.length === 0) {
    return (
      <div className="rounded-xl bg-gray-100 p-8 text-center">
        <p className="text-gray-500">오늘 예정된 경주가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 경마장 필터 */}
      <div className="flex flex-wrap gap-2">
        {tracks.map((track) => (
          <button
            key={track}
            onClick={() => setSelectedTrack(track)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedTrack === track
                ? 'bg-horse text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {track === 'all' ? '전체' : track}
          </button>
        ))}
      </div>

      {/* 경주별 예측 */}
      {filteredRaces.map((race) => (
        <RaceSection key={race.raceId} race={race} />
      ))}
    </div>
  );
}

/**
 * 개별 경주 섹션
 */
function RaceSection({ race }: { race: RaceWithPredictions }) {
  const [expanded, setExpanded] = useState(false);

  // 상위 3마만 기본 표시
  const topPredictions = race.predictions.slice(0, 3);
  const remainingPredictions = race.predictions.slice(3);

  return (
    <M3Card variant="elevated" elevation={1} className="overflow-hidden">
      {/* 경주 헤더 */}
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {race.track} 제{race.raceNo}경주
            </h3>
            <p className="text-sm text-gray-500">
              {race.raceName} · {race.distance}m
            </p>
          </div>
          <Link
            href={`/race/${race.raceId}`}
            className="text-sm text-horse hover:underline"
          >
            경주 정보 →
          </Link>
        </div>
      </div>

      {/* 예측 카드 그리드 */}
      <div className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topPredictions.map((prediction) => (
            <PredictionCard
              key={prediction.entryNo}
              prediction={prediction}
              raceId={race.raceId}
            />
          ))}
        </div>

        {/* 나머지 말 (펼침) */}
        {expanded && remainingPredictions.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {remainingPredictions.map((prediction) => (
              <PredictionCard
                key={prediction.entryNo}
                prediction={prediction}
                raceId={race.raceId}
              />
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {remainingPredictions.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            {expanded
              ? '접기'
              : `나머지 ${remainingPredictions.length}마 더보기`}
          </button>
        )}
      </div>
    </M3Card>
  );
}

/**
 * 로딩 상태
 */
function PredictionsLoading() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <M3Card key={i} variant="elevated" elevation={1}>
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mt-1 h-4 w-24 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            <PredictionCardSkeleton />
            <PredictionCardSkeleton />
            <PredictionCardSkeleton />
          </div>
        </M3Card>
      ))}
    </div>
  );
}

/**
 * Mock 데이터 생성 (API 미구현 시)
 */
function generateMockRaces(): RaceWithPredictions[] {
  const tracks = ['서울', '부산'];
  const races: RaceWithPredictions[] = [];

  for (let t = 0; t < tracks.length; t++) {
    for (let r = 1; r <= 3; r++) {
      const predictions: HorsePrediction[] = [];

      for (let h = 1; h <= 10; h++) {
        const prob = Math.max(5, 40 - h * 3 + Math.random() * 10);
        predictions.push({
          entryNo: h,
          horseName: `${tracks[t]}스타${h}`,
          winProbability: prob,
          placeProbability: prob * 1.5,
          expectedPosition: h + Math.floor(Math.random() * 3) - 1,
          totalScore: 50 + (10 - h) * 4 + Math.random() * 10,
          confidence: (10 - h) * 10,
          confidenceLevel: h <= 3 ? 'high' : h <= 6 ? 'medium' : 'low',
          predictedRank: h,
          recommendation: {
            action: h === 1 ? 'strong_bet' : h <= 3 ? 'bet' : h <= 6 ? 'consider' : 'avoid',
            reasoning: [
              h === 1
                ? '높은 레이팅과 우수한 최근 폼'
                : h <= 3
                  ? '안정적인 성적 유지'
                  : '변수가 많음',
            ],
          },
          factors: [],
          scoreBreakdown: {
            trackConditionScore: 70 + Math.random() * 20,
            gatePositionScore: 60 + Math.random() * 30,
            distanceFitScore: 65 + Math.random() * 25,
            fieldSizeScore: 55 + Math.random() * 20,
            surfaceScore: 60 + Math.random() * 25,
            ratingScore: 80 - h * 5 + Math.random() * 10,
            formScore: 75 - h * 4 + Math.random() * 15,
            burdenFitScore: 70 + Math.random() * 20,
            distancePreferenceScore: 65 + Math.random() * 25,
            jockeyScore: 70 - h * 3 + Math.random() * 15,
            trainerScore: 65 - h * 2 + Math.random() * 15,
            comboSynergyScore: 60 + Math.random() * 30,
            bloodlineScore: 55 + Math.random() * 30,
            externalTotal: 35,
            internalTotal: 55,
          },
        });
      }

      // 확률순 정렬
      predictions.sort((a, b) => b.winProbability - a.winProbability);
      predictions.forEach((p, i) => {
        p.predictedRank = i + 1;
      });

      races.push({
        raceId: `${t + 1}-20250101-${String(r).padStart(2, '0')}`,
        raceNo: r,
        raceName: `${r === 1 ? '일반' : r === 2 ? '특별' : '핸디캡'}경주`,
        track: tracks[t],
        distance: [1200, 1400, 1600, 1800][r % 4],
        predictions,
      });
    }
  }

  return races;
}
