/**
 * GET /api/v1/predictions
 *
 * 오늘의 경주 예측 조회
 *
 * KRA 공공데이터 API에서 실시간 출마표를 조회하여
 * 예측 엔진으로 승률을 계산합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PredictionEngine, fetchTodaysRaces } from '@/lib/predictions';
import {
  generateMockRaceContext,
  generateMockEntries,
} from '@/lib/predictions/mock/entry';
import { getTodayDate } from '@/lib/api/kra';
import type { HorsePrediction } from '@/types/prediction';

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
    const date = searchParams.get('date') || getTodayDate();
    const meet = searchParams.get('meet') as '1' | '2' | '3' | null;
    const raceNo = searchParams.get('raceNo');
    const useMock = searchParams.get('mock') === 'true';

    const engine = new PredictionEngine();
    let races: RaceWithPredictions[];
    let source: 'kra-live' | 'mock' = 'mock';
    const warnings: string[] = [];

    // Mock 강제 사용 또는 실제 API 조회
    if (useMock) {
      races = generateMockRacesWithPredictions(engine, meet);
    } else {
      // 실제 KRA API에서 데이터 조회
      const result = await fetchTodaysRaces(date, meet || undefined);

      if (result.success && result.races.length > 0) {
        // 실데이터로 예측 실행
        races = result.races.map((race) => {
          const prediction = engine.predictRace(race.predictionInput);

          return {
            raceId: race.raceId,
            raceNo: race.raceNo,
            raceName: race.raceName,
            track: race.trackName,
            distance: race.distance,
            predictions: prediction.predictions,
          };
        });

        source = 'kra-live';
        warnings.push(...result.warnings);
      } else {
        // 데이터 없으면 Mock 폴백
        races = generateMockRacesWithPredictions(engine, meet);
        source = 'mock';

        if (result.warnings.length > 0) {
          warnings.push(...result.warnings);
        } else {
          warnings.push('경주 데이터가 없어 Mock 데이터를 사용합니다.');
        }
      }
    }

    // 특정 경주만 필터
    const filteredRaces = raceNo
      ? races.filter((r) => r.raceNo === parseInt(raceNo, 10))
      : races;

    return NextResponse.json({
      success: true,
      data: filteredRaces,
      meta: {
        date,
        total: filteredRaces.length,
        source,
        generatedAt: new Date().toISOString(),
        modelVersion: '1.0.0-mvp',
        warnings: warnings.length > 0 ? warnings : undefined,
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
 * Mock 경주 데이터로 예측 생성 (폴백용)
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
