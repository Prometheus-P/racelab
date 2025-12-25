/**
 * Disclaimer Module
 *
 * 백테스트 결과에 대한 필수 면책조항 생성기
 * 한국 사행산업 규제 준수를 위한 법적 문구 포함
 */

// =============================================================================
// Types
// =============================================================================

/**
 * 백테스트 면책조항
 */
export interface BacktestDisclaimer {
  /** 제목 */
  title: string;

  /** 면책조항 항목들 */
  items: string[];

  /** 도박 문제 상담 전화번호 */
  helpline: string;

  /** 언어 코드 */
  language: 'ko' | 'en';

  /** 생성 시각 (ISO 8601) */
  generatedAt: string;
}

// =============================================================================
// Disclaimer Texts
// =============================================================================

/**
 * 면책조항 텍스트 (언어별)
 */
export const DISCLAIMER_TEXTS = {
  ko: {
    pastPerformance: '과거 성과는 미래 결과를 보장하지 않습니다.',
    educationalPurpose: '본 시뮬레이션은 교육 목적이며, 투자 권유가 아닙니다.',
    riskOfLoss: '실제 베팅 시 손실이 발생할 수 있습니다.',
    taxApplied: '세금(27%)이 적용된 결과입니다.',
    slippageApplied: '슬리피지가 적용된 결과입니다.',
  },
  en: {
    pastPerformance: 'Past performance does not guarantee future results.',
    educationalPurpose:
      'This simulation is for educational purposes only, not investment advice.',
    riskOfLoss: 'Actual betting may result in losses.',
    taxApplied: 'Tax (27%) has been applied to the results.',
    slippageApplied: 'Slippage has been applied to the results.',
  },
} as const;

// =============================================================================
// Disclaimer Generator
// =============================================================================

/**
 * 면책조항 생성
 *
 * @param taxApplied 세금 적용 여부 (기본값: true, 항상 27% 적용)
 * @param slippageApplied 슬리피지 적용 여부 (기본값: false)
 * @param language 언어 (기본값: 'ko')
 * @returns 면책조항 객체
 */
export function generateDisclaimer(
  taxApplied: boolean = true,
  slippageApplied: boolean = false,
  language: 'ko' | 'en' = 'ko'
): BacktestDisclaimer {
  const texts = DISCLAIMER_TEXTS[language];

  // 필수 항목
  const items: string[] = [texts.pastPerformance, texts.educationalPurpose, texts.riskOfLoss];

  // 조건부 항목
  if (taxApplied) {
    items.push(texts.taxApplied);
  }

  if (slippageApplied) {
    items.push(texts.slippageApplied);
  }

  return {
    title: language === 'ko' ? '주의사항' : 'Disclaimer',
    items,
    helpline: language === 'ko' ? '도박 문제 상담: 1336' : 'Gambling helpline: 1336',
    language,
    generatedAt: new Date().toISOString(),
  };
}
