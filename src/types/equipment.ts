/**
 * Equipment Types
 *
 * 경주마 장구 관련 타입 정의
 * 연구 문서: 장구 변경은 조교사의 승부 의지 반영
 *
 * - 눈가면(Blinkers): 시야 제한, 집중력 향상
 * - 혀끈(Tongue Tie): 호흡 원활, 제어력 향상
 * - 재갈(Bits): 제어력 조정
 */

// =============================================================================
// 장구 종류
// =============================================================================

/** 장구 종류 */
export type EquipmentType =
  | 'blinkers' // 차안대 (블링커) - 시야 제한, 집중력 향상
  | 'tongue_tie' // 혀묶기 - 호흡 원활
  | 'shadow_roll' // 섀도우롤 - 그림자 공포 방지
  | 'cheek_pieces' // 볼가리개 - 부분 시야 제한
  | 'visor' // 바이저 - 약한 시야 제한
  | 'pacifiers' // 이어플러그 - 소음 차단
  | 'bit_change' // 재갈 변경
  | 'hood' // 후드 - 시야/청각 제한
  | 'nose_band'; // 코끈 - 입 벌림 방지

/** 장구 정보 */
export interface EquipmentInfo {
  type: EquipmentType;
  /** 한글명 */
  nameKo: string;
  /** 영문명 */
  nameEn: string;
  /** 설명 */
  description: string;
  /** 효과 (점수 영향) */
  effectScore: number;
  /** 주요 대상 */
  targetBehavior: string;
}

/** 장구 상세 정보 */
export const EQUIPMENT_INFO: Record<EquipmentType, EquipmentInfo> = {
  blinkers: {
    type: 'blinkers',
    nameKo: '차안대 (블링커)',
    nameEn: 'Blinkers',
    description: '시야를 전방으로 제한하여 옆/뒤의 말에 대한 공포심 감소',
    effectScore: 0.05,
    targetBehavior: '겁많은 말, 산만한 말',
  },
  tongue_tie: {
    type: 'tongue_tie',
    nameKo: '혀묶기',
    nameEn: 'Tongue Tie',
    description: '혀가 기도를 막거나 재갈 위로 넘어가는 것을 방지, 호흡 원활',
    effectScore: 0.03,
    targetBehavior: '호흡 불안정, 재갈 거부',
  },
  shadow_roll: {
    type: 'shadow_roll',
    nameKo: '섀도우롤',
    nameEn: 'Shadow Roll',
    description: '코 위에 착용, 지면의 그림자를 보지 못하게 함',
    effectScore: 0.02,
    targetBehavior: '그림자 공포',
  },
  cheek_pieces: {
    type: 'cheek_pieces',
    nameKo: '볼가리개',
    nameEn: 'Cheek Pieces',
    description: '양쪽 볼에 부착, 블링커보다 약한 시야 제한',
    effectScore: 0.02,
    targetBehavior: '약간 산만한 말',
  },
  visor: {
    type: 'visor',
    nameKo: '바이저',
    nameEn: 'Visor',
    description: '블링커의 약한 버전, 부분적 시야 제한',
    effectScore: 0.02,
    targetBehavior: '경미한 집중력 문제',
  },
  pacifiers: {
    type: 'pacifiers',
    nameKo: '이어플러그',
    nameEn: 'Ear Muffs/Pacifiers',
    description: '귀마개, 소음에 민감한 말의 청각 차단',
    effectScore: 0.02,
    targetBehavior: '소음 민감',
  },
  bit_change: {
    type: 'bit_change',
    nameKo: '재갈 변경',
    nameEn: 'Bit Change',
    description: '재갈 종류 변경으로 제어력 조정',
    effectScore: 0.01,
    targetBehavior: '제어 문제',
  },
  hood: {
    type: 'hood',
    nameKo: '후드',
    nameEn: 'Hood',
    description: '머리 전체를 덮어 시야와 청각 동시 제한',
    effectScore: 0.04,
    targetBehavior: '매우 예민한 말',
  },
  nose_band: {
    type: 'nose_band',
    nameKo: '코끈',
    nameEn: 'Nose Band',
    description: '입을 너무 벌리는 것을 방지',
    effectScore: 0.01,
    targetBehavior: '입 벌림 문제',
  },
};

// =============================================================================
// 장구 변경 이력
// =============================================================================

/** 장구 변경 액션 */
export type EquipmentAction =
  | 'on' // 착용
  | 'off' // 해제
  | 'first'; // 최초 착용

/** 장구 변경 이력 */
export interface EquipmentChange {
  /** 경주일 */
  raceDate: string;
  /** 경주번호 */
  raceNo?: number;
  /** 장구 종류 */
  type: EquipmentType;
  /** 변경 유형 */
  action: EquipmentAction;
}

// =============================================================================
// 마필 장구 현황
// =============================================================================

/** 마필 장구 현황 */
export interface HorseEquipment {
  /** 마필 ID */
  horseId: string;
  /** 마명 */
  horseName: string;

  /** 현재 착용 장구 목록 */
  current: EquipmentType[];

  /** 이번 경주가 최초 착용인 장구 */
  firstTimeEquipment: EquipmentType[];

  /** 장구 변경 이력 (최신이 먼저) */
  history: EquipmentChange[];
}

/** 장구 효과 통계 */
export interface EquipmentEffectStats {
  /** 장구 종류 */
  type: EquipmentType;
  /** 착용 시 승률 (%) */
  winRateWith: number;
  /** 미착용 시 승률 (%) */
  winRateWithout: number;
  /** 효과 (차이) */
  effect: number;
  /** 샘플 수 */
  sampleSize: number;
}

// =============================================================================
// 유틸리티 함수
// =============================================================================

/**
 * 장구 효과 점수 계산
 * 연구 문서: 장구 착용/변경은 조교사의 승부 의지 반영
 */
export function calculateEquipmentEffect(
  current: EquipmentType[],
  firstTime: EquipmentType[] = []
): number {
  let effect = 0;

  // 현재 착용 장구 효과
  for (const type of current) {
    const info = EQUIPMENT_INFO[type];
    if (info) {
      effect += info.effectScore;
    }
  }

  // 최초 착용 보너스 (변화 = 승부 의지)
  if (firstTime.length > 0) {
    effect += 0.03; // 최초 착용 보너스
  }

  return effect;
}

/**
 * 장구 리스트를 문자열로 변환
 */
export function formatEquipmentList(equipment: EquipmentType[]): string {
  if (equipment.length === 0) return '없음';
  return equipment.map((type) => EQUIPMENT_INFO[type]?.nameKo ?? type).join(', ');
}

/**
 * 장구 약어 생성 (UI 표시용)
 * 예: blinkers → B, tongue_tie → T
 */
export function getEquipmentAbbreviation(type: EquipmentType): string {
  const abbrevMap: Record<EquipmentType, string> = {
    blinkers: 'B',
    tongue_tie: 'T',
    shadow_roll: 'SR',
    cheek_pieces: 'CP',
    visor: 'V',
    pacifiers: 'P',
    bit_change: 'BC',
    hood: 'H',
    nose_band: 'NB',
  };
  return abbrevMap[type] ?? type.charAt(0).toUpperCase();
}

/**
 * 장구 약어 문자열 생성
 * 예: ['blinkers', 'tongue_tie'] → "B T"
 */
export function formatEquipmentAbbreviations(
  equipment: EquipmentType[],
  firstTime: EquipmentType[] = []
): string {
  if (equipment.length === 0) return '-';

  return equipment
    .map((type) => {
      const abbrev = getEquipmentAbbreviation(type);
      // 최초 착용은 *로 표시
      return firstTime.includes(type) ? `${abbrev}*` : abbrev;
    })
    .join(' ');
}

/**
 * Mock 장구 데이터 생성
 * KRA API에서 제공하지 않으므로 확률적으로 생성
 */
export function generateMockEquipment(
  horseId: string,
  isDebut: boolean = false
): HorseEquipment {
  const current: EquipmentType[] = [];
  const firstTime: EquipmentType[] = [];

  // 데뷔전 말은 장구 없음
  if (isDebut) {
    return {
      horseId,
      horseName: '',
      current: [],
      firstTimeEquipment: [],
      history: [],
    };
  }

  // 블링커: 20% 확률
  if (Math.random() < 0.2) {
    current.push('blinkers');
    // 그 중 30%는 최초 착용
    if (Math.random() < 0.3) {
      firstTime.push('blinkers');
    }
  }

  // 혀묶기: 10% 확률
  if (Math.random() < 0.1) {
    current.push('tongue_tie');
    if (Math.random() < 0.3) {
      firstTime.push('tongue_tie');
    }
  }

  // 섀도우롤: 5% 확률
  if (Math.random() < 0.05) {
    current.push('shadow_roll');
  }

  return {
    horseId,
    horseName: '',
    current,
    firstTimeEquipment: firstTime,
    history: [],
  };
}
