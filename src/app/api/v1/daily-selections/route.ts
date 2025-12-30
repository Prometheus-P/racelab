/**
 * Daily Selections API
 *
 * 저장된 전략을 기반으로 오늘 경주에서 조건에 맞는 마필을 자동 추천
 *
 * GET /api/v1/daily-selections?strategyId=xxx&date=2024-01-15
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMockScreeningResult } from '@/lib/daily/screener';
import { getPresetStrategyById, ALL_PRESET_STRATEGIES } from '@/lib/dashboard/strategies';
import type { ScreeningResult } from '@/lib/daily/types';

// 캐시 설정 (5분 TTL)
const CACHE_TTL_SECONDS = 300;
const cache = new Map<string, { data: ScreeningResult; expiry: number }>();

/**
 * 캐시에서 결과 조회
 */
function getFromCache(key: string): ScreeningResult | null {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

/**
 * 캐시에 결과 저장
 */
function setToCache(key: string, data: ScreeningResult): void {
  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL_SECONDS * 1000,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get('strategyId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const usePreset = searchParams.get('preset') === 'true';

    // 전략 ID 검증
    if (!strategyId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_STRATEGY_ID',
            message: 'strategyId is required',
          },
        },
        { status: 400 }
      );
    }

    // 캐시 확인
    const cacheKey = `${strategyId}-${date}`;
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: {
          ...cachedResult,
          cache: {
            hit: true,
            ttl: CACHE_TTL_SECONDS,
            updatedAt: new Date().toISOString(),
          },
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 전략 조회
    let strategy;
    if (usePreset) {
      strategy = getPresetStrategyById(strategyId)?.strategy;
    }

    // 전략이 없으면 기본 전략 사용 (개발용)
    if (!strategy) {
      // 기본 전략: 첫 번째 프리셋 사용
      const defaultPreset = ALL_PRESET_STRATEGIES[0];
      if (!defaultPreset) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'STRATEGY_NOT_FOUND',
              message: `Strategy with id '${strategyId}' not found`,
            },
          },
          { status: 404 }
        );
      }
      strategy = defaultPreset.strategy;
    }

    // 스크리닝 실행 (현재는 더미 데이터)
    // TODO: 실제 경주 데이터와 연동
    const result = generateMockScreeningResult(strategy, date);

    // 캐시 저장
    setToCache(cacheKey, result);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        cache: {
          hit: false,
          ttl: CACHE_TTL_SECONDS,
          updatedAt: new Date().toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[daily-selections] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to generate daily selections',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 사용 가능한 프리셋 전략 목록 조회
 */
export async function OPTIONS() {
  return NextResponse.json({
    success: true,
    data: {
      presetStrategies: ALL_PRESET_STRATEGIES.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        difficulty: s.difficulty,
        riskLevel: s.riskLevel,
      })),
    },
    timestamp: new Date().toISOString(),
  });
}
