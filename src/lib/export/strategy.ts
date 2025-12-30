/**
 * Strategy JSON Export/Import Utilities
 *
 * 전략 정의를 JSON 형식으로 내보내기/가져오기
 */

import type { StrategyDefinition } from '@/lib/strategy/types';

// =============================================================================
// Types
// =============================================================================

export interface StrategyExport {
  /** 전략 정의 */
  strategy: StrategyDefinition;
  /** 내보내기 시간 */
  exportedAt: string;
  /** 내보내기 버전 */
  exportVersion: string;
  /** 앱 버전 */
  appVersion: string;
}

export interface StrategyImportResult {
  success: boolean;
  strategy?: StrategyDefinition;
  error?: string;
  warnings?: string[];
}

// =============================================================================
// Constants
// =============================================================================

const CURRENT_EXPORT_VERSION = '1.0';
const APP_VERSION = '1.4.0';

// =============================================================================
// Validation
// =============================================================================

/**
 * 전략 기본 구조 검증
 */
function validateStrategyStructure(strategy: unknown): string[] {
  const errors: string[] = [];

  if (!strategy || typeof strategy !== 'object') {
    errors.push('전략 데이터가 없거나 올바르지 않습니다.');
    return errors;
  }

  const s = strategy as Record<string, unknown>;

  // 필수 필드 검증
  if (!s.id || typeof s.id !== 'string') {
    errors.push('전략 ID가 없거나 올바르지 않습니다.');
  }
  if (!s.name || typeof s.name !== 'string') {
    errors.push('전략 이름이 없거나 올바르지 않습니다.');
  }
  if (!s.version || typeof s.version !== 'string') {
    errors.push('전략 버전이 없거나 올바르지 않습니다.');
  }
  if (!Array.isArray(s.conditions)) {
    errors.push('조건 목록이 없거나 배열이 아닙니다.');
  }
  if (!s.action || typeof s.action !== 'string') {
    errors.push('베팅 액션이 없거나 올바르지 않습니다.');
  }
  if (!s.metadata || typeof s.metadata !== 'object') {
    errors.push('메타데이터가 없거나 올바르지 않습니다.');
  }

  return errors;
}

/**
 * 조건 검증
 */
function validateConditions(conditions: unknown[]): string[] {
  const errors: string[] = [];

  conditions.forEach((condition, index) => {
    if (!condition || typeof condition !== 'object') {
      errors.push(`조건 ${index + 1}: 올바르지 않은 형식`);
      return;
    }

    const c = condition as Record<string, unknown>;

    if (!c.field || typeof c.field !== 'string') {
      errors.push(`조건 ${index + 1}: 필드가 없거나 올바르지 않습니다.`);
    }
    if (!c.operator || typeof c.operator !== 'string') {
      errors.push(`조건 ${index + 1}: 연산자가 없거나 올바르지 않습니다.`);
    }
    if (c.value === undefined || c.value === null) {
      errors.push(`조건 ${index + 1}: 값이 없습니다.`);
    }
  });

  return errors;
}

// =============================================================================
// Export Functions
// =============================================================================

/**
 * 전략을 JSON 문자열로 내보내기
 */
export function exportStrategyToJSON(strategy: StrategyDefinition): string {
  const exportData: StrategyExport = {
    strategy,
    exportedAt: new Date().toISOString(),
    exportVersion: CURRENT_EXPORT_VERSION,
    appVersion: APP_VERSION,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 전략 JSON 파일 다운로드
 */
export function downloadStrategyJSON(strategy: StrategyDefinition): void {
  const json = exportStrategyToJSON(strategy);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const filename = `strategy_${strategy.name.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${Date.now()}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =============================================================================
// Import Functions
// =============================================================================

/**
 * JSON 문자열에서 전략 가져오기
 */
export function importStrategyFromJSON(json: string): StrategyImportResult {
  const warnings: string[] = [];

  // JSON 파싱
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      success: false,
      error: 'JSON 파싱 실패: 올바른 JSON 형식이 아닙니다.',
    };
  }

  // 형식 확인
  const data = parsed as Record<string, unknown>;

  // 새 형식 (StrategyExport) vs 구 형식 (StrategyDefinition 직접)
  let strategy: unknown;
  if (data.strategy && data.exportVersion) {
    // 새 형식
    strategy = data.strategy;

    // 버전 호환성 체크
    if (data.exportVersion !== CURRENT_EXPORT_VERSION) {
      warnings.push(`내보내기 버전이 다릅니다. (파일: ${data.exportVersion}, 현재: ${CURRENT_EXPORT_VERSION})`);
    }
  } else if (data.id && data.conditions) {
    // 구 형식 (전략 직접)
    strategy = data;
    warnings.push('구 형식의 전략 파일입니다. 새 형식으로 저장하는 것을 권장합니다.');
  } else {
    return {
      success: false,
      error: '인식할 수 없는 파일 형식입니다.',
    };
  }

  // 구조 검증
  const structureErrors = validateStrategyStructure(strategy);
  if (structureErrors.length > 0) {
    return {
      success: false,
      error: structureErrors.join('\n'),
    };
  }

  // 조건 검증
  const s = strategy as StrategyDefinition;
  const conditionErrors = validateConditions(s.conditions);
  if (conditionErrors.length > 0) {
    return {
      success: false,
      error: conditionErrors.join('\n'),
    };
  }

  // 새 ID 생성 (중복 방지)
  const importedStrategy: StrategyDefinition = {
    ...s,
    id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    metadata: {
      ...s.metadata,
      updatedAt: new Date().toISOString(),
    },
  };

  return {
    success: true,
    strategy: importedStrategy,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * 파일에서 전략 가져오기
 */
export async function importStrategyFromFile(file: File): Promise<StrategyImportResult> {
  // 파일 타입 확인
  if (!file.name.endsWith('.json')) {
    return {
      success: false,
      error: 'JSON 파일만 가져올 수 있습니다.',
    };
  }

  // 파일 크기 제한 (1MB)
  if (file.size > 1024 * 1024) {
    return {
      success: false,
      error: '파일 크기가 너무 큽니다. (최대 1MB)',
    };
  }

  try {
    const text = await file.text();
    return importStrategyFromJSON(text);
  } catch {
    return {
      success: false,
      error: '파일을 읽는 중 오류가 발생했습니다.',
    };
  }
}
