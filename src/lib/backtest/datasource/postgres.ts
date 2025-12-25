/**
 * PostgresDataSource
 *
 * PostgreSQL 기반 백테스트 데이터 소스
 * Drizzle ORM을 사용하여 실제 DB에서 경주 데이터 조회
 */

import { db } from '../../db/client';
import { races, entries, results, oddsSnapshots, tracks } from '../../db/schema';
import { eq, and, gte, lte, inArray, asc } from 'drizzle-orm';
import type { RaceDataSource, RaceFilters, RaceResultData } from '../executor';
import type { RaceContext, EntryContext } from '../../strategy/evaluator';
import { calculateOddsDrift, calculateOddsStdDev } from '../../strategy/evaluator';

// =============================================================================
// PostgresDataSource Implementation
// =============================================================================

/**
 * PostgreSQL 데이터 소스
 * RaceDataSource 인터페이스 구현
 */
export class PostgresDataSource implements RaceDataSource {
  /**
   * 날짜 범위 내 경주 ID 목록 조회
   */
  async getRaceIds(
    dateFrom: string,
    dateTo: string,
    filters?: RaceFilters
  ): Promise<string[]> {
    // 기본 조건: 날짜 범위
    const conditions = [gte(races.raceDate, dateFrom), lte(races.raceDate, dateTo)];

    // 완료된 경주만 조회 (백테스트용)
    conditions.push(eq(races.status, 'finished'));

    // 경주 유형 필터
    if (filters?.raceTypes && filters.raceTypes.length > 0) {
      conditions.push(inArray(races.raceType, filters.raceTypes));
    }

    // 등급 필터
    if (filters?.grades && filters.grades.length > 0) {
      conditions.push(inArray(races.grade, filters.grades));
    }

    const raceList = await db
      .select({ id: races.id })
      .from(races)
      .where(and(...conditions));

    // 트랙 필터 (별도 처리 - track code와 매칭)
    if (filters?.tracks && filters.tracks.length > 0) {
      const trackCodes = new Set(filters.tracks);
      const raceIds: string[] = [];

      for (const race of raceList) {
        // Race ID 형식: horse-seoul-1-20250101 (type-track-raceNo-date)
        const parts = race.id.split('-');
        if (parts.length >= 2) {
          const trackCode = parts[1];
          if (trackCodes.has(trackCode)) {
            raceIds.push(race.id);
          }
        }
      }

      return raceIds;
    }

    return raceList.map((r) => r.id);
  }

  /**
   * 경주 상세 컨텍스트 조회
   */
  async getRaceContext(raceId: string): Promise<RaceContext | null> {
    // 1. 경주 기본 정보 조회 (with track)
    const raceResult = await db
      .select({
        race: races,
        track: {
          id: tracks.id,
          code: tracks.code,
          name: tracks.name,
        },
      })
      .from(races)
      .leftJoin(tracks, eq(races.trackId, tracks.id))
      .where(eq(races.id, raceId));

    if (raceResult.length === 0) {
      return null;
    }

    const { race, track } = raceResult[0];

    // 2. 출전 엔트리 조회
    const entryList = await db
      .select()
      .from(entries)
      .where(eq(entries.raceId, raceId));

    // 3. 배당률 시계열 데이터 조회
    const oddsList = await db
      .select()
      .from(oddsSnapshots)
      .where(eq(oddsSnapshots.raceId, raceId))
      .orderBy(asc(oddsSnapshots.time));

    // 4. 엔트리별 배당 데이터 그룹화
    const oddsMap = new Map<number, typeof oddsList>();
    for (const odds of oddsList) {
      const entryOdds = oddsMap.get(odds.entryNo) ?? [];
      entryOdds.push(odds);
      oddsMap.set(odds.entryNo, entryOdds);
    }

    // 5. EntryContext 생성
    const entryContexts: EntryContext[] = entryList.map((entry) => {
      const entryOdds = oddsMap.get(entry.entryNo) ?? [];
      const lastOdds = entryOdds.length > 0 ? entryOdds[entryOdds.length - 1] : null;
      const firstOdds = entryOdds.length > 0 ? entryOdds[0] : null;

      // 배당률 시계열 (oddsTimeline)
      const oddsTimeline = entryOdds.map((o) => ({
        time: o.time,
        odds_win: parseFloat(o.oddsWin ?? '0'),
        odds_place: o.oddsPlace ? parseFloat(o.oddsPlace) : undefined,
      }));

      // 배당률 변화율 (drift)
      let odds_drift_pct: number | undefined;
      if (firstOdds && lastOdds && firstOdds.oddsWin && lastOdds.oddsWin) {
        const firstWin = parseFloat(firstOdds.oddsWin);
        const lastWin = parseFloat(lastOdds.oddsWin);
        odds_drift_pct = calculateOddsDrift(firstWin, lastWin);
      }

      // 배당률 표준편차
      let odds_stddev: number | undefined;
      if (entryOdds.length > 1) {
        const winOddsList = entryOdds
          .filter((o) => o.oddsWin)
          .map((o) => parseFloat(o.oddsWin!));
        if (winOddsList.length > 1) {
          odds_stddev = calculateOddsStdDev(winOddsList);
        }
      }

      // 매출 비율 계산
      let pool_win_pct: number | undefined;
      if (lastOdds?.poolWin && lastOdds?.poolTotal && lastOdds.poolTotal > 0) {
        pool_win_pct = (lastOdds.poolWin / lastOdds.poolTotal) * 100;
      }

      return {
        raceId: entry.raceId,
        entryNo: entry.entryNo,

        // 배당률 관련
        odds_win: lastOdds?.oddsWin ? parseFloat(lastOdds.oddsWin) : undefined,
        odds_place: lastOdds?.oddsPlace ? parseFloat(lastOdds.oddsPlace) : undefined,
        odds_drift_pct,
        odds_stddev,

        // 수급 관련
        popularity_rank: lastOdds?.popularityRank ?? undefined,
        pool_total: lastOdds?.poolTotal ?? undefined,
        pool_win_pct,

        // 경주마 정보 (Phase 1)
        horse_rating: entry.rating ?? undefined,
        burden_weight: entry.burdenWeight ? parseFloat(entry.burdenWeight) : undefined,

        // 시계열 데이터
        oddsTimeline,
      };
    });

    // 6. RaceContext 생성
    // Extract track code from race ID if track is null
    let trackCode = track?.code ?? '';
    if (!trackCode && raceId) {
      const parts = raceId.split('-');
      if (parts.length >= 2) {
        trackCode = parts[1];
      }
    }

    return {
      raceId: race.id,
      raceDate: race.raceDate,
      raceNo: race.raceNo,
      track: trackCode,
      raceType: race.raceType as 'horse' | 'cycle' | 'boat',
      grade: race.grade ?? undefined,
      startTime: race.startTime ? parseTime(race.raceDate, race.startTime) : undefined,
      entries: entryContexts,
    };
  }

  /**
   * 경주 결과 조회
   */
  async getRaceResult(raceId: string): Promise<RaceResultData | null> {
    const resultList = await db
      .select()
      .from(results)
      .where(eq(results.raceId, raceId));

    if (resultList.length === 0) {
      return null;
    }

    // 취소 여부 확인 (모든 착순이 0이면 취소)
    const canceled = resultList.every((r) => r.finishPosition === 0);

    // 착순 맵 생성
    const finishPositions = new Map<number, number>();
    for (const result of resultList) {
      finishPositions.set(result.entryNo, result.finishPosition);
    }

    // 배당률 맵 생성 (DB에는 원 단위로 저장, 1000으로 나누어 배율로 변환)
    const winDividends = new Map<number, number>();
    const placeDividends = new Map<number, number>();

    for (const result of resultList) {
      if (result.dividendWin) {
        winDividends.set(result.entryNo, result.dividendWin / 1000);
      }
      if (result.dividendPlace) {
        placeDividends.set(result.entryNo, result.dividendPlace / 1000);
      }
    }

    return {
      raceId,
      finishPositions,
      dividends: {
        win: winDividends,
        place: placeDividends.size > 0 ? placeDividends : undefined,
      },
      canceled,
    };
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * 시간 문자열을 Date 객체로 변환
 */
function parseTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}+09:00`); // KST
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * 데이터 소스 팩토리
 * DB에 데이터가 있으면 PostgresDataSource 반환,
 * 없으면 null 반환 (호출자가 Mock fallback 처리)
 */
export async function checkDatabaseHasData(): Promise<boolean> {
  try {
    const result = await db
      .select({ id: races.id })
      .from(races)
      .where(eq(races.status, 'finished'))
      .limit(1);

    return result.length > 0;
  } catch {
    return false;
  }
}
