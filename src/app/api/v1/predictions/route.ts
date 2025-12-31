/**
 * GET /api/v1/predictions
 *
 * 오늘의 경주 예측 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { PredictionEngine } from '@/lib/predictions';
import {
  generateMockRaceContext,
  generateMockEntries,
  createFullFieldScenario,
} from '@/lib/predictions/mock/entry';
import type { HorsePrediction, RacePrediction } from '@/types/prediction';

interface RaceWithPredictions {
  raceId: string;
  raceNo: number;
  raceName: string;
  track: string;
  distance: number;
  predictions: HorsePrediction[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const meet = searchParams.get('meet');
    const raceNo = searchParams.get('raceNo');

    // TODO: 실제 API 연동 시 KRA API에서 오늘 경주 데이터 조회
    // 현재는 Mock 데이터로 예측 생성

    const engine = new PredictionEngine();
    const races = generateMockRacesWithPredictions(engine, meet);

    // 특정 경주만 필터
    const filteredRaces = raceNo
      ? races.filter((r) => r.raceNo === parseInt(raceNo, 10))
      : races;

    return NextResponse.json({
      success: true,
      data: filteredRaces,
      meta: {
        date: date || new Date().toISOString().split('T')[0].replace(/-/g, ''),
        total: filteredRaces.length,
        generatedAt: new Date().toISOString(),
        modelVersion: '1.0.0-mvp',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[/api/v1/predictions] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PREDICTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Mock 경주 데이터로 예측 생성
 */
function generateMockRacesWithPredictions(
  engine: PredictionEngine,
  meetFilter?: string | null
): RaceWithPredictions[] {
  const tracks = [
    { code: '1', name: '서울' },
    { code: '3', name: '부산' },
  ];

  const filteredTracks = meetFilter
    ? tracks.filter((t) => t.code === meetFilter || t.name === meetFilter)
    : tracks;

  const races: RaceWithPredictions[] = [];

  for (const track of filteredTracks) {
    // 각 경마장당 6개 경주 생성
    for (let raceNo = 1; raceNo <= 6; raceNo++) {
      const distance = [1000, 1200, 1400, 1600, 1800, 2000][raceNo - 1];
      const fieldSize = 8 + Math.floor(Math.random() * 6); // 8-13두

      const raceContext = generateMockRaceContext({
        meetCode: track.code as '1' | '2' | '3',
        distance,
        fieldSize,
        moisture: 8 + Math.random() * 10,
      });

      const entries = generateMockEntries(fieldSize);

      // 예측 실행
      const prediction = engine.predictRace({
        race: raceContext,
        entries,
      });

      races.push({
        raceId: raceContext.raceId,
        raceNo,
        raceName: getRaceName(raceNo, distance),
        track: track.name,
        distance,
        predictions: prediction.predictions,
      });
    }
  }

  return races;
}

/**
 * 경주명 생성
 */
function getRaceName(raceNo: number, distance: number): string {
  const grades = ['일반', '특별', '핸디캡', '혼합', '오픈', '국제'];
  const grade = grades[raceNo % grades.length];

  if (distance <= 1200) return `${grade}경주 (단거리)`;
  if (distance <= 1600) return `${grade}경주 (마일)`;
  if (distance <= 2000) return `${grade}경주 (중거리)`;
  return `${grade}경주 (장거리)`;
}
