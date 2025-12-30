/**
 * Daily Screener
 *
 * 저장된 전략을 기반으로 오늘 경주에서 조건에 맞는 마필을 스크리닝
 */

import type { StrategyDefinition, StrategyCondition } from '@/lib/strategy/types';
import { EXTENDED_FIELD_METADATA } from '@/lib/strategy/types';
import type {
  DailySelection,
  MatchedCondition,
  ScreeningRequest,
  ScreeningResult,
  RaceForScreening,
  EntryForScreening,
} from './types';

/**
 * 단일 조건 평가
 */
function evaluateCondition(
  condition: StrategyCondition,
  entry: EntryForScreening
): { matched: boolean; actualValue: unknown } {
  const { field, operator, value } = condition;
  const actualValue = entry[field];

  // 값이 없으면 조건 불충족
  if (actualValue === undefined || actualValue === null) {
    return { matched: false, actualValue: null };
  }

  const numValue = Number(actualValue);

  switch (operator) {
    case 'eq':
      return { matched: actualValue === value, actualValue };

    case 'ne':
      return { matched: actualValue !== value, actualValue };

    case 'gt':
      return { matched: numValue > Number(value), actualValue };

    case 'gte':
      return { matched: numValue >= Number(value), actualValue };

    case 'lt':
      return { matched: numValue < Number(value), actualValue };

    case 'lte':
      return { matched: numValue <= Number(value), actualValue };

    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        const [min, max] = value;
        return {
          matched: numValue >= Number(min) && numValue <= Number(max),
          actualValue,
        };
      }
      return { matched: false, actualValue };

    case 'in':
      if (Array.isArray(value)) {
        return { matched: (value as unknown[]).includes(actualValue), actualValue };
      }
      return { matched: false, actualValue };

    default:
      return { matched: false, actualValue };
  }
}

/**
 * 연산자 심볼 반환
 */
function getOperatorSymbol(operator: string): string {
  const symbols: Record<string, string> = {
    eq: '=',
    ne: '≠',
    gt: '>',
    gte: '≥',
    lt: '<',
    lte: '≤',
    between: '범위',
    in: '포함',
  };
  return symbols[operator] || operator;
}

/**
 * 필드 라벨 반환
 */
function getFieldLabel(field: string): string {
  const metadata = EXTENDED_FIELD_METADATA[field as keyof typeof EXTENDED_FIELD_METADATA];
  return metadata?.label || field;
}

/**
 * 출주마가 전략 조건을 충족하는지 평가
 */
export function evaluateEntry(
  strategy: StrategyDefinition,
  entry: EntryForScreening
): { matched: boolean; matchedConditions: MatchedCondition[]; matchScore: number } {
  const matchedConditions: MatchedCondition[] = [];
  let matchedCount = 0;

  for (const condition of strategy.conditions) {
    const { matched, actualValue } = evaluateCondition(condition, entry);

    if (matched) {
      matchedCount++;
      matchedConditions.push({
        field: String(condition.field),
        label: getFieldLabel(String(condition.field)),
        operator: getOperatorSymbol(condition.operator),
        expectedValue: condition.value,
        actualValue,
      });
    }
  }

  // 모든 조건이 AND로 결합
  const allMatched = matchedCount === strategy.conditions.length;

  // 매칭 점수: 충족된 조건 비율 * 100
  const matchScore =
    strategy.conditions.length > 0
      ? Math.round((matchedCount / strategy.conditions.length) * 100)
      : 0;

  return {
    matched: allMatched,
    matchedConditions,
    matchScore,
  };
}

/**
 * 경주 목록에서 전략 조건에 맞는 마필 스크리닝
 */
export function screenRaces(
  strategy: StrategyDefinition,
  races: RaceForScreening[],
  entriesByRace: Map<string, EntryForScreening[]>,
  options: { limit?: number } = {}
): DailySelection[] {
  const selections: DailySelection[] = [];
  const limit = options.limit ?? 50;

  for (const race of races) {
    const entries = entriesByRace.get(race.id) || [];

    for (const entry of entries) {
      const { matched, matchedConditions, matchScore } = evaluateEntry(strategy, entry);

      if (matched) {
        selections.push({
          raceId: race.id,
          raceTime: race.startTime,
          track: race.track,
          raceNo: race.raceNo,
          entryNo: entry.entryNo,
          horseName: entry.horseName,
          odds: entry.odds_win ?? 0,
          oddsChange: entry.odds_drift_pct ?? 0,
          popularity: entry.popularity_rank ?? 0,
          matchedConditions,
          matchScore,
        });

        if (selections.length >= limit) {
          break;
        }
      }
    }

    if (selections.length >= limit) {
      break;
    }
  }

  // 경주 시간순 정렬
  return selections.sort((a, b) => {
    const timeA = new Date(a.raceTime).getTime();
    const timeB = new Date(b.raceTime).getTime();
    return timeA - timeB;
  });
}

/**
 * 스크리닝 실행 (전체 플로우)
 */
export async function runScreening(
  request: ScreeningRequest,
  dataProvider: {
    getRaces: (date: string, tracks?: string[]) => Promise<RaceForScreening[]>;
    getEntries: (raceIds: string[]) => Promise<Map<string, EntryForScreening[]>>;
  }
): Promise<ScreeningResult> {
  const date = request.date || new Date().toISOString().split('T')[0];

  // 1. 경주 목록 조회
  const races = await dataProvider.getRaces(date, request.tracks);

  // 2. 출주마 정보 조회
  const raceIds = races.map((r) => r.id);
  const entriesByRace = await dataProvider.getEntries(raceIds);

  // 3. 스크리닝 실행
  const selections = screenRaces(request.strategy, races, entriesByRace, {
    limit: request.limit,
  });

  // 총 스크리닝된 마필 수 계산
  let totalEntries = 0;
  entriesByRace.forEach((entries) => {
    totalEntries += entries.length;
  });

  return {
    request: {
      strategyId: request.strategy.id,
      strategyName: request.strategy.name,
      date,
    },
    selections,
    totalRacesScreened: races.length,
    totalEntriesScreened: totalEntries,
  };
}

/**
 * 더미 데이터 생성 (개발/테스트용)
 */
export function generateMockScreeningResult(
  strategy: StrategyDefinition,
  date: string
): ScreeningResult {
  const tracks = ['서울', '부산', '제주'];
  const horseNames = [
    '천둥번개',
    '바람의아들',
    '금빛질주',
    '승리의함성',
    '번개질풍',
    '황금마차',
    '푸른바다',
    '붉은태양',
  ];

  const selections: DailySelection[] = [];
  const numSelections = Math.floor(Math.random() * 5) + 2; // 2-6개

  for (let i = 0; i < numSelections; i++) {
    const track = tracks[Math.floor(Math.random() * tracks.length)];
    const raceNo = Math.floor(Math.random() * 10) + 1;
    const hour = 14 + Math.floor(i / 2);
    const minute = (i % 2) * 30;

    selections.push({
      raceId: `${date}-${track}-${raceNo}`,
      raceTime: `${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`,
      track,
      raceNo,
      entryNo: Math.floor(Math.random() * 12) + 1,
      horseName: horseNames[Math.floor(Math.random() * horseNames.length)],
      odds: Math.round((Math.random() * 15 + 2) * 10) / 10,
      oddsChange: Math.round((Math.random() * 40 - 20) * 10) / 10,
      popularity: Math.floor(Math.random() * 8) + 1,
      matchedConditions: strategy.conditions.map((c) => ({
        field: String(c.field),
        label: getFieldLabel(String(c.field)),
        operator: getOperatorSymbol(c.operator),
        expectedValue: c.value,
        actualValue: c.value, // 더미: 조건 충족으로 가정
      })),
      matchScore: 100,
    });
  }

  // 시간순 정렬
  selections.sort((a, b) => new Date(a.raceTime).getTime() - new Date(b.raceTime).getTime());

  return {
    request: {
      strategyId: strategy.id,
      strategyName: strategy.name,
      date,
    },
    selections,
    totalRacesScreened: 24,
    totalEntriesScreened: 168,
  };
}
