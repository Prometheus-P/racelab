/**
 * Slippage Module
 *
 * 배당률 슬리피지(미끄러짐) 모델링
 * 실제 베팅 시 발생하는 배당률 변동을 시뮬레이션
 */

// =============================================================================
// Types
// =============================================================================

/**
 * 슬리피지 설정
 */
export interface SlippageConfig {
  /** 슬리피지 활성화 여부 */
  enabled: boolean;

  /** 최소 변화율 (%) - 음수는 배당률 하락 */
  minPercent: number;

  /** 최대 변화율 (%) - 양수는 배당률 상승 */
  maxPercent: number;

  /** 분포 유형 */
  distribution: 'uniform' | 'gaussian';

  /** 재현성을 위한 시드 (선택) */
  seed?: number;
}

/**
 * 기본 슬리피지 설정
 * - 기본값: 비활성화
 * - 활성화 시: ±5% 범위, Gaussian 분포
 */
export const DEFAULT_SLIPPAGE_CONFIG: SlippageConfig = {
  enabled: false,
  minPercent: -5,
  maxPercent: 5,
  distribution: 'gaussian',
};

// =============================================================================
// Seeded Random Number Generator
// =============================================================================

/**
 * 시드 기반 의사 난수 생성기 (Mulberry32)
 * 재현성을 위해 사용
 *
 * @param seed 초기 시드값
 * @returns 0~1 사이의 난수를 반환하는 함수
 */
export function createSeededRng(seed: number): () => number {
  let state = seed;

  return function () {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// =============================================================================
// Slippage Functions
// =============================================================================

/**
 * 배당률에 슬리피지 적용
 *
 * @param odds 원래 배당률
 * @param config 슬리피지 설정
 * @param rng 난수 생성기 (선택, 기본값: Math.random)
 * @returns 슬리피지가 적용된 배당률
 */
export function applySlippage(
  odds: number,
  config: SlippageConfig,
  rng: () => number = Math.random
): number {
  // 비활성화된 경우 원래 값 반환
  if (!config.enabled) {
    return odds;
  }

  // 0 배당률은 그대로 반환
  if (odds === 0) {
    return 0;
  }

  const { minPercent, maxPercent, distribution } = config;
  const range = maxPercent - minPercent;

  let variance: number;

  if (distribution === 'gaussian') {
    // Box-Muller transform으로 정규 분포 생성
    variance = generateGaussianVariance(rng, minPercent, maxPercent);
  } else {
    // 균등 분포
    variance = rng() * range + minPercent;
  }

  // 슬리피지 적용
  return odds * (1 + variance / 100);
}

/**
 * Gaussian 분포 기반 변동값 생성 (Box-Muller transform)
 *
 * @param rng 난수 생성기
 * @param minPercent 최소 변화율
 * @param maxPercent 최대 변화율
 * @returns 변동값 (%)
 */
function generateGaussianVariance(
  rng: () => number,
  minPercent: number,
  maxPercent: number
): number {
  const range = maxPercent - minPercent;

  // Box-Muller transform
  const u1 = rng();
  const u2 = rng();

  // u1이 0이면 log(0)이 -Infinity가 되므로 방지
  const safeU1 = u1 === 0 ? 0.0001 : u1;

  const z = Math.sqrt(-2 * Math.log(safeU1)) * Math.cos(2 * Math.PI * u2);

  // 표준편차를 범위의 1/4로 설정하여 ~95%가 범위 내에 들어오도록 함
  const stddev = range / 4;

  // 평균은 0 (범위 중앙)
  const mean = (maxPercent + minPercent) / 2;

  const variance = z * stddev + mean;

  // 범위 내로 클램프 (극단값 방지)
  return Math.max(minPercent, Math.min(maxPercent, variance));
}
