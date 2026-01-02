/**
 * KRA API Client
 *
 * 공공데이터 포털 한국마사회 API 통합 클라이언트
 */

import { fetchApi, fetchApiSafe, FetchResult } from '../fetcher';
import { KRA_API_REGISTRY, KRA_BASE_URL, type KraApiKey } from './registry';

/** API 요청 옵션 */
export interface KraApiOptions {
  /** 경마장 코드 (1:서울, 2:제주, 3:부경) */
  meet?: string;
  /** 페이지 번호 */
  pageNo?: number;
  /** 페이지 당 결과 수 */
  numOfRows?: number;
  /** 추가 파라미터 */
  params?: Record<string, string>;
}

/**
 * KRA API 호출
 *
 * @param apiKey 레지스트리에 정의된 API 키
 * @param dateValue 날짜 값 (형식은 API마다 다름: YYYYMMDD 또는 YYYYMM)
 * @param options 추가 옵션
 * @returns API 응답 아이템 배열
 *
 * @example
 * // 기수 성적 조회
 * const results = await kraApi('JOCKEY_RESULT', '20241225', { meet: '1' });
 */
export async function kraApi<T = unknown>(
  apiKey: KraApiKey,
  dateValue: string,
  options: KraApiOptions = {}
): Promise<T[]> {
  const apiConfig = KRA_API_REGISTRY[apiKey];
  const KRA_API_KEY = process.env.KRA_API_KEY;

  // 파라미터 구성
  const params: Record<string, string> = {
    ...options.params,
  };

  if (options.meet) {
    params.meet = options.meet;
  }

  if (options.numOfRows) {
    params.numOfRows = options.numOfRows.toString();
  }

  if (options.pageNo) {
    params.pageNo = options.pageNo.toString();
  }

  const items = await fetchApi(
    KRA_BASE_URL,
    apiConfig.endpoint,
    KRA_API_KEY,
    params,
    dateValue,
    `KRA ${apiKey}`,
    'KRA_API_KEY',
    apiConfig.dateParam
  );

  return items as T[];
}

/**
 * KRA API 호출 (에러 시 빈 배열 반환)
 *
 * @param apiKey 레지스트리에 정의된 API 키
 * @param dateValue 날짜 값
 * @param options 추가 옵션
 * @returns API 응답 결과 (에러 시 빈 배열 + 경고 메시지)
 */
export async function kraApiSafe<T = unknown>(
  apiKey: KraApiKey,
  dateValue: string,
  options: KraApiOptions = {}
): Promise<FetchResult<T>> {
  const apiConfig = KRA_API_REGISTRY[apiKey];
  const KRA_API_KEY = process.env.KRA_API_KEY;

  // 파라미터 구성
  const params: Record<string, string> = {
    ...options.params,
  };

  if (options.meet) {
    params.meet = options.meet;
  }

  if (options.numOfRows) {
    params.numOfRows = options.numOfRows.toString();
  }

  if (options.pageNo) {
    params.pageNo = options.pageNo.toString();
  }

  const result = await fetchApiSafe(
    KRA_BASE_URL,
    apiConfig.endpoint,
    KRA_API_KEY,
    params,
    dateValue,
    `KRA ${apiKey}`,
    'KRA_API_KEY',
    apiConfig.dateParam
  );

  return {
    data: result.data as T[],
    isStale: result.isStale,
    warning: result.warning,
  };
}

/**
 * 오늘 날짜를 YYYYMMDD 형식으로 반환
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 오늘 날짜를 YYYYMM 형식으로 반환
 */
export function getTodayYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * 날짜 문자열 변환: YYYY-MM-DD → YYYYMMDD
 */
export function formatDateParam(date: string): string {
  return date.replace(/-/g, '');
}

/**
 * 날짜 문자열 변환: YYYYMMDD → YYYY-MM-DD
 */
export function parseDateParam(date: string): string {
  if (date.length !== 8) return date;
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

/**
 * 요청 간 딜레이 (ms) - 할당량 보호를 위한 기본값
 */
const REQUEST_DELAY_MS = parseInt(process.env.KRA_REQUEST_DELAY_MS || '200', 10);

/**
 * 딜레이 유틸리티
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 모든 경마장에서 데이터 수집 (순차 요청)
 *
 * 할당량 보호를 위해 병렬 요청 대신 순차 요청 사용
 * 각 요청 사이에 딜레이 적용 (기본 200ms, KRA_REQUEST_DELAY_MS로 조정 가능)
 *
 * @param apiKey 레지스트리에 정의된 API 키
 * @param dateValue 날짜 값
 * @param options 추가 옵션
 * @returns 모든 경마장 데이터 병합 결과
 */
export async function kraApiAllMeets<T = unknown>(
  apiKey: KraApiKey,
  dateValue: string,
  options: Omit<KraApiOptions, 'meet'> = {}
): Promise<T[]> {
  const meets = ['1', '2', '3']; // 서울, 제주, 부경
  const allItems: T[] = [];

  // 순차 요청으로 할당량 소진 방지
  for (let i = 0; i < meets.length; i++) {
    const meet = meets[i];

    // 첫 번째 요청 이후 딜레이 적용
    if (i > 0 && REQUEST_DELAY_MS > 0) {
      await delay(REQUEST_DELAY_MS);
    }

    try {
      const result = await kraApiSafe<T>(apiKey, dateValue, { ...options, meet });
      if (result.data) {
        allItems.push(...result.data);
      }
    } catch {
      // 개별 경마장 실패는 무시하고 계속 진행
      continue;
    }
  }

  return allItems;
}
